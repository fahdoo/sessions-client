import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate environment variables
    const bucketName = process.env.AWS_S3_BUCKET;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!bucketName || !region || !accessKeyId || !secretAccessKey) {
      console.error('Missing AWS environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' }, 
        { status: 500 }
      );
    }

    // Initialize S3 Client
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const { userId } = await getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAuthSupabaseClient();

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('audio_url, original_audio_url, user_id')
      .eq('id', params.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as Blob;
    const duration = Number(formData.get('duration'));

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Generate unique ID for this processing attempt
    const processId = randomUUID();
    const key = `audio-produced/room_${params.id}_${processId}.m4a`;

    try {
      const arrayBuffer = await audioFile.arrayBuffer();
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: 'audio/mp4',
      }));
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload to S3' }, { status: 500 });
    }

    // Generate S3 URL
    const audioUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;

    // Update the session, but only set original_audio_url if it's not already set
    const updateData: Record<string, any> = {
      audio_url: audioUrl,
      audio_status: 'processed',
      duration: Math.round(duration)
    };

    // Only set original_audio_url if it's not already set
    if (!session.original_audio_url) {
      updateData.original_audio_url = session.audio_url;
    }

    const { error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: Math.round(duration)
    });

  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Error processing audio' },
      { status: 500 }
    );
  }
} 