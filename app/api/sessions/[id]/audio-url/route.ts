import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/sessions/[id]/audio-url route hit', params.id);
  const { userId } = getAuth(req);
  const sessionId = params.id;

  try {
    const supabase = createSupabaseClient();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('audio_url, audio_status, user_id, is_public')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session) {
      console.log('Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if the session is public or if the user owns the session
    if (!session.is_public && (!userId || session.user_id !== userId)) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (session.audio_status === 'processing' || !session.audio_url) {
      console.log('Audio processing in progress or no audio URL');
      return NextResponse.json({ message: 'Audio processing in progress' }, { status: 202 });
    }

    // Extract the S3 key from the audio_url
    const s3Key = session.audio_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    console.log('Signed URL generated successfully');
    return NextResponse.json({ url: signedUrl });
  } catch (error: unknown) {
    console.error('Error fetching audio URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
