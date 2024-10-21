import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateSummary } from '@/lib/summarization';
import { extractLearningsFromTranscript } from '@/lib/learning-extraction';

interface TranscriptUpdate {
  transcript_url: string;
  transcript_status: 'completed' | 'in_progress';
  updated_at: string;
  summary?: string;
  learnings?: string[];
}

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
      .select('transcript_url, user_id, transcript_status, is_public, summary')
      .eq('id', sessionId)
      .single();

    if (error) throw error;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.is_public && (!userId || session.user_id !== userId)) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!session.transcript_url) {
      return NextResponse.json({ error: 'Transcript URL not found' }, { status: 404 });
    }

    // Generate summary if it doesn't exist
    if (!session.summary) {
      console.log('Summary not found. Generating summary...');
      // Extract the S3 key from the transcript_url
      const s3Key = session.transcript_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

      // Fetch the transcript from S3
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });

      const response = await s3Client.send(getCommand);
      const transcriptString = await response.Body?.transformToString();

      if (transcriptString) {
        const summary = await generateSummary(transcriptString);

        // Update the session with the new summary
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ summary })
          .eq('id', sessionId);

        if (updateError) {
          console.error('Error updating summary:', updateError);
        } else {
          console.log('Summary generated and saved successfully');
          session.summary = summary;
        }
      }
    }

    // Generate signed URL for transcript
    const s3Key = session.transcript_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
    });
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return NextResponse.json({ 
      transcriptUrl: signedUrl,
      summary: session.summary
    });
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
  console.log('Received transcript length:', JSON.stringify(transcript).length);
  console.log('isCompleted:', isCompleted);
  console.log('Transcript start time:', transcript.metadata.startTime);
  console.log('Transcript end time:', transcript.metadata.endTime);

  const sessionId = params.id;

  try {
    // Use a static S3 key for the transcript file
    const s3Key = `transcripts/${sessionId}.json`;
    console.log('S3 Key:', s3Key);

    // Convert transcript to string before uploading
    const transcriptString = JSON.stringify(transcript);

    // Upload transcript to S3
    console.log('Uploading transcript to S3...');
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: s3Key,
      Body: transcriptString,
      ContentType: 'application/json',
    }));
    console.log('Transcript uploaded to S3 successfully');

    // Initialize update object
    const updateObject: TranscriptUpdate = {
      transcript_url: `s3://${process.env.AWS_S3_BUCKET}/${s3Key}`,
      transcript_status: isCompleted ? 'completed' : 'in_progress',
      updated_at: new Date().toISOString()
    };

    // Generate summary and extract learnings if the transcript is complete and long enough
    if (isCompleted && transcriptString.length >= 50) {
      console.log('Transcript is complete and long enough. Generating summary and extracting learnings...');
      const [summaryResult, extractedLearnings] = await Promise.all([
        generateSummary(transcriptString),
        extractLearningsFromTranscript(transcriptString)
      ]);

      if (summaryResult !== null) {
        updateObject.summary = summaryResult;
      }
      updateObject.learnings = extractedLearnings;
      console.log('Summary and learnings generated successfully');
    }

    // Update session in Supabase
    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('sessions')
      .update(updateObject)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    console.log('Session updated successfully');
    return NextResponse.json({ 
      message: 'Transcript processed successfully', 
      data,
      summary: updateObject.summary,
      learnings: updateObject.learnings
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
