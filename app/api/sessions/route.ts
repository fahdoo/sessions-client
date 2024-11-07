import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { createRoom } from '@/lib/livekit';
import { generateRoomName } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAuthSupabaseClient();
  const { title, topics, agentVariant = 'calm', isPublic = true } = await request.json();
  
  // Convert newline-separated topics into array, filtering out empty lines
  const topicsArray = topics
    .split('\n')
    .map((topic: string) => topic.trim())
    .filter((topic: string) => topic); // Only keep non-empty strings

  console.log('Create a new session for user:', userId, 'with title:', title, 'and topics:', topicsArray);
  
  try {
    // Insert the session with topics array
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        title,
        user_id: userId,
        topics: topicsArray,
        system_prompt: null,
        audio_status: 'pending',
        transcript_status: 'pending',
        agent_variant: agentVariant,
        is_public: isPublic
      })
      .select(`
        id,
        title,
        user_id,
        topics,
        system_prompt,
        audio_status,
        transcript_status,
        agent_variant,
        created_at,
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

    // Fetch recent sessions with summaries, respecting privacy settings
    const { data: recentSessions, error: recentSessionsError } = await supabase
      .from('sessions')
      .select('id, title, created_at, summary, learnings')
      .eq('user_id', userId)
      .match(isPublic 
        ? { is_public: true } // For public sessions, only get public ones
        : {} // For private sessions, get all (both public and private)
      )
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentSessionsError) {
      console.error('Error fetching recent sessions:', recentSessionsError);
      throw recentSessionsError;
    }

    const sessionDataCamelized = camelizeKeys(sessionData);
    const metadataObject = {
      ...sessionDataCamelized,
      recentSessions: recentSessions?.map((session: {
        id: string;
        title: string;
        created_at: string;
        summary: string;
        learnings: string[];
      }) => ({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        summary: session.summary,
        learnings: session.learnings
      })),
      topics: topicsArray,
      agentVariant
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
      return NextResponse.json({
        ...sessionDataCamelized,
        livekitError: 'Failed to create LiveKit room'
      });
    }

    return NextResponse.json(sessionDataCamelized);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
