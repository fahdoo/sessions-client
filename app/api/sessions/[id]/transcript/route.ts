import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { generateSummary } from '@/lib/summarization';
import { extractLearningsFromTranscript } from '@/lib/learning-extraction';
import { generateTitle } from '@/lib/title-generation';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createAuthSupabaseClient();

  try {
    // First verify session ownership
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('user_id, transcript_status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !sessionData) {
      console.error('Error verifying session:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check authorization
    if (sessionData.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get transcript from database
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .select('transcript')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (transcriptError) {
      console.error('Error fetching transcript:', transcriptError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ 
      transcript: transcriptData?.transcript || [],
      status: sessionData.transcript_status
    });

  } catch (error) {
    console.error('Error in transcript fetch:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const { transcript, isCompleted } = await request.json();

  try {
    const supabase = await createAuthSupabaseClient();

    // Update status to processing
    const { error: statusError } = await supabase
      .from('sessions')
      .update({ transcript_status: 'processing' })
      .eq('id', sessionId);

    if (statusError) {
      console.error('Error updating status:', statusError);
      return NextResponse.json({ error: 'Status update failed' }, { status: 500 });
    }

    // Save to transcripts table
    const { error: transcriptError } = await supabase
      .from('transcripts')
      .upsert({
        session_id: sessionId,
        transcript,
        user_id: userId
      }, {
        onConflict: 'session_id'
      });

    if (transcriptError) {
      console.error('Error saving transcript:', transcriptError);
      return NextResponse.json({ error: 'Transcript save failed' }, { status: 500 });
    }

    // If session is completed, generate title, summary and extract learnings
    if (isCompleted) {
      try {
        // Convert transcript segments to text for processing
        const transcriptText = transcript
          .sort((a: any, b: any) => a.startTime - b.startTime)
          .map((segment: any) => segment.text)
          .join(' ');

        // Generate title, summary and extract learnings in parallel
        const [newTitle, summary, learnings] = await Promise.all([
          generateTitle(transcriptText, 'New Session'),
          generateSummary(transcriptText),
          extractLearningsFromTranscript(transcriptText)
        ]);

        // Update session with all generated content
        const { error: updateError } = await supabase
          .from('sessions')
          .update({ 
            title: newTitle,
            summary: summary || null,
            learnings: learnings || [],
            transcript_status: 'completed'
          })
          .eq('id', sessionId);

        if (updateError) {
          console.error('Error updating session with generated content:', updateError);
        }
      } catch (processingError) {
        console.error('Error processing transcript:', processingError);
        // Continue even if processing fails
      }
    } else {
      // Update status to db_synced if not completed
      const { error: finalStatusError } = await supabase
        .from('sessions')
        .update({ transcript_status: 'db_synced' })
        .eq('id', sessionId);

      if (finalStatusError) {
        console.error('Error updating final status:', finalStatusError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in transcript update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const { transcript, isCompleted } = await request.json();

  // Only handle S3 upload in this endpoint
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: `transcripts/${sessionId}.json`,
      Body: JSON.stringify(transcript),
      ContentType: 'application/json',
    });

    await s3Client.send(command);

    return NextResponse.json({ 
      success: true,
      message: 'Transcript saved to S3 successfully'
    });
  } catch (error) {
    console.error('Error saving to S3:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save transcript to S3',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
