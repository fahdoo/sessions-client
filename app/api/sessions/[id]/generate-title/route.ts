import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { generateTitle } from '@/lib/title-generation';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  let transcript, originalTitle;

  try {
    const bodyText = await request.text();
    console.log('Received request body:', bodyText);

    if (!bodyText) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }

    const body = JSON.parse(bodyText);
    transcript = body.transcript;
    originalTitle = body.originalTitle;

    console.log('Parsed request body:', { transcript: transcript?.slice(0, 100) + '...', originalTitle });
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ error: 'Invalid request body', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 400 });
  }

  if (!transcript || typeof transcript !== 'string') {
    return NextResponse.json({ error: 'Invalid transcript' }, { status: 400 });
  }

  const supabase = createAuthSupabaseClient();

  try {
    const newTitle = await generateTitle(transcript, originalTitle);

    // Only update if the title has changed
    if (newTitle !== originalTitle) {
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
