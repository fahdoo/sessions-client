import { NextRequest, NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getAuth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  const sessionId = params.id;

  // Check if the session exists and if it's public or owned by the user
  const { data: session, error } = await supabase
    .from('sessions')
    .select('audio_url, is_public, user_id')
    .eq('id', sessionId)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Check if the session is public or if the user is the owner
  if (!session.is_public && (!userId || session.user_id !== userId)) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const audioKey = session.audio_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: audioKey,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json({ error: 'Failed to generate audio URL' }, { status: 500 });
  }
}