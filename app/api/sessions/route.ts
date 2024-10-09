import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { createRoom } from '@/lib/livekit';
import { generateRoomName } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClerkSupabaseClientSsr();
  const { title, systemPrompt } = await request.json();

  try {
    // Insert the session
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({ title, user_id: userId, system_prompt: systemPrompt })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Create the LiveKit room
    const roomName = generateRoomName(sessionData.id);
    await createRoom(roomName);

    return NextResponse.json(camelizeKeys(sessionData));
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}