import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { transcript, originalTitle, sessionId } = await request.json();
    
    console.log('Title generation request received:', {
      hasTranscript: !!transcript,
      transcriptType: typeof transcript,
      originalTitle,
      sessionId
    });

    if (!sessionId) {
      console.error('Missing sessionId in request');
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Convert transcript to string if needed
    let transcriptText: string;
    if (typeof transcript === 'string') {
      transcriptText = transcript;
    } else if (Array.isArray(transcript)) {
      transcriptText = transcript
        .sort((a, b) => a.startTime - b.startTime)
        .map(segment => segment.text)
        .join(' ');
    } else {
      console.error('Invalid transcript format:', typeof transcript);
      return NextResponse.json({ 
        error: 'Invalid transcript format',
        details: `Expected string or array, got ${typeof transcript}`
      }, { status: 400 });
    }

    if (transcriptText.length < 50) {
      console.warn('Transcript too short:', transcriptText.length);
      return NextResponse.json({ title: originalTitle });
    }

    console.log('Generating title with OpenAI:', {
      transcriptLength: transcriptText.length,
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
    });

    let newTitle = completion.choices[0].message.content?.trim() || originalTitle;
    newTitle = newTitle.replace(/^["'](.+)["']$/, '$1');

    console.log('Generated title:', {
      originalTitle,
      newTitle,
      sessionId
    });

    // Update session title in database
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

    console.log('Title updated successfully:', {
      sessionId,
      newTitle
    });

    return NextResponse.json({ 
      success: true,
      title: newTitle 
    });

  } catch (error) {
    console.error('Title generation error:', error);
    return NextResponse.json({ 
      error: 'Title generation failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
