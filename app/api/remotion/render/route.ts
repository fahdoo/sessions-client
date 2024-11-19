import { NextRequest, NextResponse } from 'next/server';
import { renderMediaOnLambda } from '@remotion/lambda/client';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getSignedAudioUrl, getBaseUrl } from '@/lib/server';
import { Session } from '@/lib/types';
import { camelizeKeys } from 'humps';

interface RenderRequest {
  sessionId: string;
  format?: 'default' | 'instagram' | 'youtube' | 'tiktok';
}

function getVideoDimensions(format: 'default' | 'instagram' | 'youtube' | 'tiktok') {
  switch (format) {
    case 'instagram':
      return { width: 1080, height: 1080 }; // Square
    case 'youtube':
      return { width: 1920, height: 1080 }; // 16:9
    case 'tiktok':
      return { width: 1080, height: 1920 }; // 9:16
    default:
      return { width: 1080, height: 1080 }; // Default square format
  }
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId, format = 'default' } = await request.json() as RenderRequest;
    
    const supabase = await createAuthSupabaseClient();
    
    // Add debug logging for raw values
    console.log('Query inputs:', {
      sessionId,
      sessionIdType: typeof sessionId,
      userId,
      userIdType: typeof userId
    });

    // First try a simple query
    const { data: basicCheck, error: basicError } = await supabase
      .from('sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    console.log('Basic session check:', { basicCheck, basicError });

    // Then try the full query
    const { data: rawSession, error } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        audio_url,
        duration,
        user_id,
        user:users!inner (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .eq('id', sessionId)
      .eq('users.id', userId)
      .is('deleted_at', null)
      .single();

    console.log('Session query result:', { rawSession, error });

    if (error || !rawSession) {
      throw new Error('Session not found');
    }

    const session = camelizeKeys(rawSession) as Session;

    // Add debug logging
    console.log('Session data:', session);

    if (!session.audioUrl) {
      throw new Error('Session has no audio file');
    }

    // Get signed URL for audio file
    const signedAudioUrl = await getSignedAudioUrl(session.audioUrl);
    if (!signedAudioUrl) {
      throw new Error('Failed to generate signed URL for audio');
    }

    // Get the user data
    if (!session.user?.avatar) {
      throw new Error('User avatar not found');
    }

    if (!session.user?.username) {
      throw new Error('Username not found');
    }

    // Duration is already in seconds, no need to convert
    const durationInSeconds = session.duration || 30;
    
    // Limit video length to 10 minutes
    if (durationInSeconds > 600) {
      throw new Error('Video duration cannot exceed 10 minutes');
    }

    console.log('Starting render with:', {
      audioUrl: signedAudioUrl,
      avatar: session.user.avatar,
      username: session.user.username,
      title: session.title,
      duration: durationInSeconds
    });

    // Configure webhook
    const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL 
      ? `${process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL}/api/webhooks/remotion`
      : `http://localhost:3000/api/webhooks/remotion`;

    // Create simpler output path
    const outputPath = `videos/${format}/${Date.now()}.mp4`;
    console.log('Video will be saved to:', outputPath);

    // Get video dimensions once
    const { width, height } = getVideoDimensions(format);

    // Start the render
    const renderResponse = await renderMediaOnLambda({
      functionName: process.env.REMOTION_FUNCTION_NAME!,
      region: process.env.AWS_REGION as "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2",
      serveUrl: process.env.REMOTION_SITE_URL!,
      composition: 'AudiogramBasic',
      inputProps: {
        audioFileName: signedAudioUrl,
        coverImgFileName: session.user.avatar,
        titleText: `${session.title} with @${session.user.username}`,
        titleColor: "rgba(186, 186, 186, 0.93)",
        subtitlesFileName: "",
        subtitlesText: "",
        onlyDisplayCurrentSentence: false,
        subtitlesTextColor: "rgba(255, 255, 255, 0.93)",
        subtitlesLinePerPage: 4,
        subtitlesZoomMeasurerSize: 10,
        subtitlesLineHeight: 98,
        waveColor: "#a3a5ae",
        waveFreqRangeStartIndex: 7,
        waveLinesToDisplay: 29,
        waveNumberOfSamples: "256",
        mirrorWave: true,
        durationInSeconds,
        audioOffsetInSeconds: 0,
      },
      codec: 'h264',
      outName: outputPath,
      webhook: {
        url: webhookUrl,
        secret: process.env.REMOTION_WEBHOOK_SECRET || null,
        customData: {
          sessionId: session.id,
          format
        }
      },
      concurrencyPerLambda: 1,
      framesPerLambda: 1000,
      everyNthFrame: 12,
      maxRetries: 1,
      imageFormat: "jpeg",
      privacy: "public",
      timeoutInMilliseconds: 600000,
    });

    // Extract renderId as string
    const renderId = renderResponse.renderId;

    console.log('Render started:', {
      renderId,
      outputPath,
      format,
      sessionId: session.id
    });

    // Poll for initial errors (sometimes Lambda fails immediately)
    const progressUrl = `https://remotionlambda-${process.env.AWS_REGION}.s3.amazonaws.com/renders/${renderId}/progress.json`;
    const progressResponse = await fetch(progressUrl);
    if (progressResponse.ok) {
      const progress = await progressResponse.json();
      if (progress.errors?.length > 0) {
        console.error('Render failed immediately:', {
          renderId,
          errors: progress.errors,
          renderMetadata: progress.renderMetadata
        });
        throw new Error(`Render failed: ${progress.errors[0].message}`);
      }
    }

    // Create a new video record
    const { error: insertError } = await supabase
      .from('videos')
      .insert({
        session_id: session.id,
        render_id: renderId,
        format,
        status: 'pending',
        video_url: null,
        width,
        height,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Video record insert error:', insertError);
      throw new Error(`Failed to create video record: ${insertError.message}`);
    }

    return NextResponse.json({ renderId });
  } catch (error) {
    console.error('Render error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to start render',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 