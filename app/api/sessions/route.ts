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
          last_name
        )
      `)
      .single();

    if (sessionError) throw sessionError;

    console.log('Session data:', JSON.stringify(sessionData, null, 2));

    const sessionDataCamelized = camelizeKeys(sessionData);
    const metadata = JSON.stringify(sessionDataCamelized);
    console.log('Creating LiveKit room with metadata:', metadata);
    // Create the LiveKit room
    const roomName = generateRoomName(sessionData.id);
    await createRoom(roomName, metadata);

    return NextResponse.json(sessionDataCamelized);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}