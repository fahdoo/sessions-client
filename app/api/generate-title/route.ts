import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { serverFetch } from '@/lib/server-utils';
import { TranscriptSegment } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let transcript: TranscriptSegment[] | string = [];
  let originalTitle: string = '';
  let sessionId: string = '';

  try {
    const body = await request.json();
    transcript = body.transcript;
    originalTitle = body.originalTitle || '';
    sessionId = body.sessionId;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // If no transcript provided, try to fetch it
    if (!transcript) {
      console.log('No transcript provided, fetching from API...');
      const response = await serverFetch(`/api/sessions/${sessionId}/transcript`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transcript: ${response.statusText}`);
      }
      const data = await response.json();
      transcript = data.transcript;
    }

    // Convert transcript array to string if needed
    let transcriptText: string;
    if (Array.isArray(transcript)) {
      transcriptText = transcript
        .sort((a, b) => a.startTime - b.startTime)
        .map(segment => segment.text)
        .join(' ');
    } else if (typeof transcript === 'string') {
      transcriptText = transcript;
    } else {
      return NextResponse.json({ 
        error: 'Invalid transcript format', 
        details: 'Transcript must be either a string or an array of transcript segments'
      }, { status: 400 });
    }

    if (transcriptText.length < 50) {
      return NextResponse.json({ 
        error: 'Transcript too short',
        details: 'Transcript must be at least 50 characters long'
      }, { status: 400 });
    }

    console.log('Processing request:', { 
      transcriptLength: transcriptText.length,
      originalTitle,
      sessionId
    });

    // Generate title using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates concise and engaging titles for podcast episodes based on their transcripts. The transcript may be partial or incomplete. Generate the title without any surrounding quotation marks." 
        },
        { 
          role: "user", 
          content: `Generate a short, engaging title for this podcast episode based on the following transcript:\n\n${transcriptText}\n\nTitle:` 
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    }).catch(error => {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate title with OpenAI');
    });

    let newTitle = completion.choices[0].message.content?.trim() || originalTitle;
    newTitle = newTitle.replace(/^["'](.+)["']$/, '$1');

    // Update session title in database
    try {
      const supabase = await createAuthSupabaseClient();
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ title: newTitle })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Database update error:', updateError);
        throw new Error('Failed to update session title in database');
      }
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json({ 
        error: 'Database error',
        details: dbError instanceof Error ? dbError.message : 'Failed to update session title',
        title: newTitle
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      title: newTitle 
    });

  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json({ 
      error: 'Title generation failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      fallbackTitle: originalTitle
    }, { status: 500 });
  }
}
