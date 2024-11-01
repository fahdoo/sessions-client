import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { generateSummary } from '@/lib/summarization';
import { extractLearningsFromTranscript } from '@/lib/learning-extraction';
import { generateTitle } from '@/lib/title-generation';

export async function POST(
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
    // Get transcript
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .select('transcript')
      .eq('session_id', sessionId)
      .single();

    if (transcriptError || !transcriptData?.transcript) {
      throw new Error('Failed to fetch transcript');
    }

    // Convert transcript segments to text
    const transcriptText = transcriptData.transcript
      .sort((a: any, b: any) => a.startTime - b.startTime)
      .map((segment: any) => segment.text)
      .join(' ');

    // Process everything in parallel
    const [title, summary, learnings] = await Promise.allSettled([
      generateTitle(transcriptText, 'New Session'),
      generateSummary(transcriptText),
      extractLearningsFromTranscript(transcriptText)
    ]);

    // Update session with whatever succeeded
    const updates: any = {};
    if (title.status === 'fulfilled') updates.title = title.value;
    if (summary.status === 'fulfilled') updates.summary = summary.value;
    if (learnings.status === 'fulfilled') updates.learnings = learnings.value;

    const { error: updateError } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
    }

    // Return success even if some processes failed
    return NextResponse.json({ 
      success: true,
      processed: {
        title: title.status === 'fulfilled',
        summary: summary.status === 'fulfilled',
        learnings: learnings.status === 'fulfilled'
      }
    });
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 