import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { createRoom } from '@/lib/livekit';
import { generateRoomName } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAuthSupabaseClient();
  const { title, systemPrompt } = await request.json();
  console.log('Create a new session for user:', userId, 'with title:', title);
  try {
    // Insert the session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({ title, user_id: userId, system_prompt: systemPrompt })
      .select(`
        *,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .single();

    if (sessionError) {
      console.error('Supabase error:', sessionError);
      throw sessionError;
    }

    console.log('Session data:', JSON.stringify(sessionData, null, 2));

    // Fetch recent sessions with summaries
    const { data: recentSessions, error: recentSessionsError } = await supabase
      .from('sessions')
      .select('id, title, created_at, summary, learnings')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentSessionsError) {
      console.error('Error fetching recent sessions:', recentSessionsError);
      throw recentSessionsError;
    }

    const sessionDataCamelized = camelizeKeys(sessionData);
    const metadataObject = {
      ...sessionDataCamelized,
      recentSessions: recentSessions.map(session => ({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        summary: session.summary,
        learnings: session.learnings
      }))
    };
    const metadata = JSON.stringify(metadataObject);
    console.log('Creating LiveKit room with metadata:', metadata);
    // Create the LiveKit room
    const roomName = generateRoomName(sessionData.id);
    console.log('Generated room name:', roomName);
    try {
      await createRoom(roomName, metadata);
    } catch (livekitError) {
      console.error('LiveKit room creation error:', livekitError);
      // If LiveKit room creation fails, we should still return the session data
      // but also include an error message
      return NextResponse.json({
        ...sessionDataCamelized,
        livekitError: 'Failed to create LiveKit room'
      });
    }

    return NextResponse.json(sessionDataCamelized);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
