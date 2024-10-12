import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('Transcript route hit:', params.id);
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;

  try {
    const supabase = createSupabaseClient();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('transcript_url, user_id, transcript_status')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!session.transcript_url) {
      return NextResponse.json({ error: 'Transcript URL not found' }, { status: 404 });
    }

    // Extract the S3 key from the transcript_url
    const s3Key = session.transcript_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log('Signed URL:', signedUrl);

    return NextResponse.json({ transcriptUrl: signedUrl });
  } catch (error) {
    console.error('Error fetching transcript URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('POST function started');
  const { userId } = getAuth(req);
  if (!userId) {
    console.log('Unauthorized: No userId found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('UserId:', userId);
  console.log('SessionId:', params.id);

  const { transcript, isCompleted } = await req.json();
  console.log('Received transcript length:', transcript.length);
  console.log('isCompleted:', isCompleted);

  const sessionId = params.id;

  try {
    // Use a static S3 key for the transcript file
    const s3Key = `transcripts/${sessionId}.txt`;
    console.log('S3 Key:', s3Key);

    // Upload transcript to S3
    console.log('Uploading transcript to S3...');
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: transcript,
      ContentType: 'text/plain',
    }));
    console.log('Transcript uploaded to S3 successfully');

    // Update session in Supabase
    console.log('Updating session in Supabase with transcript URL...');
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('sessions')
      .update({
        transcript_url: `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`,
        transcript_status: isCompleted ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) {
      console.error('Supabase update error:', error);
      throw error;
    }

    console.log('Supabase update successful:', data);

    return NextResponse.json({ message: 'Transcript saved successfully', data });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}