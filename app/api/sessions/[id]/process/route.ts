import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { generateTitle } from '@/lib/ai/generateTitle';
import { generateSummary } from '@/lib/ai/generateSummary';
import { extractLearnings } from '@/lib/ai/extractLearnings';
import { TranscriptSegment } from '@/lib/types';

interface SessionUpdates {
  title?: string;
  summary?: string | null;
  learnings?: string[] | null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  console.log('Starting session processing:', params.id);

  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createAuthSupabaseClient();

  try {
    console.log('Starting session processing for session:', sessionId);

    // Get transcript
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('transcripts')
      .select('transcript')
      .eq('session_id', sessionId)
      .single();

    if (transcriptError || !transcriptData?.transcript) {
      console.error('Transcript fetch error:', transcriptError);
      throw new Error('Failed to fetch transcript');
    }

    // Convert transcript segments to text
    const transcriptText = transcriptData.transcript
      .sort((a: TranscriptSegment, b: TranscriptSegment) => a.startTime - b.startTime)
      .map((segment: TranscriptSegment) => segment.text)
      .join(' ');

    console.log('Processing transcript of length:', transcriptText.length);

    // Process everything with string transcript
    const [title, summary, learnings] = await Promise.allSettled([
      generateTitle(transcriptText, 'New Session', sessionId),
      generateSummary(transcriptText),
      extractLearnings(transcriptText)
    ]);

    console.log('Processing results:', {
      titleStatus: title.status,
      summaryStatus: summary.status,
      learningsStatus: learnings.status,
      titleValue: title.status === 'fulfilled' ? title.value : null
    });

    // Update session with whatever succeeded
    const updates: SessionUpdates = {};
    
    if (title.status === 'fulfilled' && title.value) {
      updates.title = title.value;
      console.log('Generated title:', title.value);
    } else if (title.status === 'rejected') {
      console.error('Title generation failed:', title.reason);
    }
    
    if (summary.status === 'fulfilled') {
      updates.summary = summary.value;
    }
    
    if (learnings.status === 'fulfilled') {
      updates.learnings = learnings.value;
    }

    console.log('Generated content:', {
      title: title.status === 'fulfilled' ? 'success' : 'failed',
      summary: summary.status === 'fulfilled' ? 'success' : 'failed',
      learnings: learnings.status === 'fulfilled' ? 'success' : 'failed'
    });

    // Log the updates being made
    console.log('Updating session with:', updates);

    const { error: updateError } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    console.log('Session update completed successfully');

    return NextResponse.json({ 
      success: true,
      processed: {
        title: title.status === 'fulfilled',
        summary: summary.status === 'fulfilled',
        learnings: learnings.status === 'fulfilled'
      }
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Session processing error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 