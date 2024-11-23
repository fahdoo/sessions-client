import { NextRequest, NextResponse } from 'next/server';
import { renderMediaOnLambda } from '@remotion/lambda/client';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getSignedAudioUrl, getSignedUrl } from '@/lib/server';
import { Session } from '@/lib/types';
import { camelizeKeys } from 'humps';
import { AudiogramInputProps, VideoFormat, VIDEO_FORMATS } from '@/components/audiogram/types';

interface RenderRequest {
  sessionId: string;
  config: {
    title: string;
    startTime: number;
    endTime: number;
  };
  format?: VideoFormat;
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { sessionId, config, format = 'square' } = await request.json() as RenderRequest;
    
    console.log('Render request received:', { sessionId, config, format });

    const supabase = await createAuthSupabaseClient();
    
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

    if (error || !rawSession) {
      console.error('Error fetching session:', error);
      throw new Error('Session not found');
    }

    const session = camelizeKeys(rawSession) as Session;

    if (!session.audioUrl) {
      throw new Error('Session has no audio file');
    }

    const signedAudioUrl = await getSignedAudioUrl(session.audioUrl);
    if (!signedAudioUrl) {
      throw new Error('Failed to generate signed URL for audio');
    }

    const transcriptUrl = session.transcriptUrl || session.audioUrl.replace('.m4a', '.json');
    const signedTranscriptUrl = transcriptUrl ? await getSignedUrl(transcriptUrl) : undefined;

    const { width, height } = VIDEO_FORMATS[format];

    if (!session.user) {
      throw new Error('User data is missing');
    }

    console.log('Starting render with:', {
      audioUrl: signedAudioUrl,
      avatar: session.user.avatar,
      username: session.user.username,
      title: session.title,
      duration: config.endTime - config.startTime,
      format
    });

    const compositionId = `Audiogram${format.charAt(0).toUpperCase() + format.slice(1)}`;

    const startTime = Date.now();
    const renderResponse = await renderMediaOnLambda({
      functionName: process.env.REMOTION_FUNCTION_NAME!,
      region: process.env.AWS_REGION as "us-east-1" | "us-east-2" | "us-west-1" | "us-west-2",
      serveUrl: process.env.REMOTION_SITE_URL!,
      composition: compositionId,
      inputProps: {
        audioFileName: signedAudioUrl,
        coverImgFileName: session.user.avatar || '',
        titleText: config.title || session.title,
        titleColor: "#cbd5e1",
        username: session.user.username || 'Unknown',
        waveColor: "#3b82f6",
        waveFreqRangeStartIndex: 7,
        waveLinesToDisplay: 29,
        waveNumberOfSamples: "256",
        mirrorWave: true,
        durationInSeconds: config.endTime - config.startTime,
        audioOffsetInSeconds: config.startTime,
        transcriptUrl: signedTranscriptUrl,
        subtitlesTextColor: "#cbd5e1",
      },
      codec: 'h264',
      outName: `videos/${format}/${Date.now()}.mp4`,
      webhook: {
        url: process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL 
          ? `${process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL}/api/webhooks/remotion`
          : `http://localhost:3000/api/webhooks/remotion`,
        secret: process.env.REMOTION_WEBHOOK_SECRET || null,
        customData: {
          sessionId: session.id,
          format
        }
      },
      concurrencyPerLambda: 1,
      framesPerLambda: 2000,
      everyNthFrame: 6,
      maxRetries: 1,
      imageFormat: "jpeg",
      privacy: "public",
      timeoutInMilliseconds: 600000,
    });

    const renderId = renderResponse.renderId;

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

    const renderTime = Date.now() - startTime;

    console.log('Render completed:', {
      renderId,
      duration: renderTime,
      format,
      success: renderResponse.ok
    });

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