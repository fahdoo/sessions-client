import { NextRequest, NextResponse } from 'next/server';
import { EgressClient, EncodedFileOutput, S3Upload } from 'livekit-server-sdk';
import { getAuth } from '@clerk/nextjs/server';

const egressClient = new EgressClient(
  process.env.NEXT_PUBLIC_LIVEKIT_URL!,
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { roomName, action } = await req.json();

  if (!roomName || !action) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    if (action === 'start') {
      const fileOutput = new EncodedFileOutput({
        filepath: `${roomName}-${Date.now()}.mp4`,
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

      const result = await egressClient.startRoomCompositeEgress(
        roomName, 
        {
          file: fileOutput
        },
        { audioOnly: true }
      );
      
      return NextResponse.json({ egressId: result.egressId });
    } else if (action === 'stop') {
      await egressClient.stopEgress(roomName);
      return NextResponse.json({ message: 'Recording stopped' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error managing recording:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}