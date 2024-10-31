import { NextRequest, NextResponse } from 'next/server';
import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';

const egressClient = new EgressClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  console.log('POST /api/livekit/recording route hit');

  const { userId } = getAuth(req);
  if (!userId) {
    console.error('Unauthorized: No userId found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { roomName, action } = await req.json();
    console.log(`Recording action: ${action} for room: ${roomName}`);

    if (!roomName || !action) {
      console.error('Bad request: Missing roomName or action');
      return NextResponse.json({ error: 'Missing roomName or action' }, { status: 400 });
    }

    // Extract session ID from room name
    const sessionId = roomName.replace('room_', '');
    const supabase = await createAuthSupabaseClient();

    if (action === 'start') {
      // Check if a recording is already in progress
      const { data: existingSession, error: sessionError } = await supabase
        .from('sessions')
        .select('audio_status')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('Error checking session status:', sessionError);
        return NextResponse.json({ error: 'Error checking session status' }, { status: 500 });
      }

      if (existingSession?.audio_status === 'recording') {
        console.log('Recording already in progress');
        return NextResponse.json({ message: 'Recording already in progress' }, { status: 200 });
      }

      // Update session status to recording
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ audio_status: 'recording' })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session status:', updateError);
      }

      // Start the recording
      const fileOutput = new EncodedFileOutput({
        filepath: `audio/${roomName}-${Date.now()}`,
        output: {
          case: 's3',
          value: new S3Upload({
            accessKey: process.env.AWS_ACCESS_KEY_ID!,
            secret: process.env.AWS_SECRET_ACCESS_KEY!,
            bucket: process.env.AWS_S3_BUCKET!,
            region: process.env.AWS_REGION!,
          }),
        },
      });

      const result = await egressClient.startRoomCompositeEgress(roomName, {
        file: fileOutput
      }, { audioOnly: true });

      return NextResponse.json({ egressId: result.egressId });
    } else if (action === 'stop') {
      // Update session status to processing
      const { error: updateError } = await supabase
        .from('sessions')
        .update({ audio_status: 'processing' })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session status:', updateError);
      }

      // Stop the recording
      try {
        await egressClient.stopEgress(roomName);
        return NextResponse.json({ message: 'Recording stopped' });
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('404')) {
          return NextResponse.json({ message: 'No active recording found to stop' });
        }
        throw error;
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing recording:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}
