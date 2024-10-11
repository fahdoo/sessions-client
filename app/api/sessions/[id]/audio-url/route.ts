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
      .select('audio_url, audio_status, user_id')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (session.audio_status === 'processing' || !session.audio_url) {
      return NextResponse.json({ message: 'Audio processing in progress' }, { status: 202 });
    }

    // Extract the S3 key from the audio_url
    const s3Key = session.audio_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

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