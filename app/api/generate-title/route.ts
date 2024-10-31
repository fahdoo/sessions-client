import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { serverFetch } from '@/lib/server-utils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let transcript, originalTitle, sessionId;

  try {
    const body = await request.json();
    transcript = body.transcript;
    originalTitle = body.originalTitle;
    sessionId = body.sessionId;

    // If no transcript provided, try to fetch it
    if (!transcript && sessionId) {
      const response = await serverFetch(`/api/sessions/${sessionId}/transcript`);
      if (response.ok) {
        const data = await response.json();
        transcript = data.transcript;
      }
    }

    console.log('Processing request:', { 
      transcript: transcript?.slice(0, 100) + '...',
      originalTitle,
      sessionId
    });
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json(
      { error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 400 }
    );
  }

  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json({ error: 'Invalid transcript' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates concise and engaging titles for podcast episodes based on their transcripts. The transcript may be partial or incomplete. Generate the title without any surrounding quotation marks." },
        { role: "user", content: `Generate a short, engaging title for this podcast episode based on the following transcript:\n\n${transcript}\n\nTitle:` }
      ],
      max_tokens: 50,
    });

    let newTitle = completion.choices[0].message.content?.trim() || originalTitle;
    
    // Remove only surrounding quotation marks
    newTitle = newTitle.replace(/^["'](.+)["']$/, '$1');

    // If sessionId is provided, update the session title in the database
    if (sessionId) {
      const supabase = await createAuthSupabaseClient();
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ title: newTitle })
        .eq('id', sessionId)
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating session title:', updateError);
        return NextResponse.json({ error: 'Failed to update session title' }, { status: 500 });
      }
    }

    return NextResponse.json({ title: newTitle });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
