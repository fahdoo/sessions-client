import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClient } from '@/lib/supabase-auth';
import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';
import { getAuth } from '@clerk/nextjs/server';

const egressClient = new EgressClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  console.log('Received POST request to /api/livekit/recording');

  const { userId } = getAuth(req);
  if (!userId) {
    console.log('Unauthorized request: No userId found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { roomName, action } = await req.json();
  console.log(`Request parameters: roomName=${roomName}, action=${action}`);

  if (!roomName || !action) {
    console.log('Missing required parameters');
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    if (action === 'start') {
      // Check if the session already has a recording
      const supabase = createClerkSupabaseClient();
      const { data: session, error } = await supabase
        .from('sessions')
        .select('audio_url')
        .eq('id', roomName.split('-')[1])
        .single();

      if (error) {
        console.error('Error fetching session:', error);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
      }

      if (session?.audio_url) {
        return NextResponse.json({ error: 'Session already has a recording' }, { status: 400 });
      }

      console.log(`Starting recording for room: ${roomName}`);
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

      console.log('Configured S3 upload for recording');

      const result = await egressClient.startRoomCompositeEgress(
        roomName, 
        {
          file: fileOutput
        },
        { audioOnly: true }
      );
      
      console.log(`Recording started successfully. Egress ID: ${result.egressId}`);
      return NextResponse.json({ egressId: result.egressId });
    } else if (action === 'stop') {
      console.log(`Stopping recording for room: ${roomName}`);
      try {
        await egressClient.stopEgress(roomName);
        console.log('Recording stopped successfully');
        return NextResponse.json({ message: 'Recording stopped' });
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('404')) {
          console.log('No active recording found to stop');
          return NextResponse.json({ message: 'No active recording found to stop' });
        }
        throw error;
      }
    } else {
      console.log(`Invalid action received: ${action}`);
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing recording:', error);
    return NextResponse.json({ error: 'Internal server error', details: error }, { status: 500 });
  }
}