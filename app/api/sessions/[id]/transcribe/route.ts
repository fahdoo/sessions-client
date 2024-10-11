import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { transcript, isCompleted } = await req.json();
  const sessionId = params.id;

  try {
    // Upload transcript to S3
    const s3Key = `transcripts/${sessionId}-${Date.now()}.txt`;
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: transcript,
      ContentType: 'text/plain',
    }));

    // Update session in Supabase
    const supabase = createClerkSupabaseClientSsr();
    const { data, error } = await supabase
      .from('sessions')
      .update({
        transcript_url: `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`,
        transcript_status: isCompleted ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select();

    if (error) throw error;

    return NextResponse.json({ message: 'Transcript saved successfully', data });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}