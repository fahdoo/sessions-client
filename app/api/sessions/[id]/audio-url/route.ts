import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
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
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;

  try {
    const supabase = createClerkSupabaseClientSsr();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('audio_url, audio_status, created_at, updated_at')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    console.log('Session data:', session);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.audio_url) {
      console.log('Audio URL is null. Session details:', {
        id: sessionId,
        audio_status: session.audio_status,
        created_at: session.created_at,
        updated_at: session.updated_at
      });

      if (session.audio_status === 'completed') {
        return NextResponse.json({ error: 'Audio processing completed but URL not found' }, { status: 500 });
      } else if (session.audio_status === 'in_progress') {
        return NextResponse.json({ error: 'Audio processing in progress' }, { status: 202 });
      } else {
        return NextResponse.json({ error: 'Audio not yet processed' }, { status: 404 });
      }
    }

    // Extract the S3 key from the audio_url
    const s3Key = session.audio_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

    if (!s3Key) {
      return NextResponse.json({ error: 'Invalid audio URL' }, { status: 400 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error fetching audio URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}