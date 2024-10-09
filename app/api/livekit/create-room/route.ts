import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/livekit';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    console.log(`Received request to create room for session: ${sessionId}`);
    const roomName = `session_${sessionId}`;
    const room = await createRoom(roomName);
    console.log('Room created:', room);

    const supabase = createClerkSupabaseClientSsr();
    const { data, error } = await supabase
      .from('sessions')
      .update({ room_name: room.name })
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating Supabase:', error);
      throw error;
    }
    console.log('Supabase update result:', data);

    return NextResponse.json({ roomName: room.name });
  } catch (error) {
    console.error('Error in create-room route:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}