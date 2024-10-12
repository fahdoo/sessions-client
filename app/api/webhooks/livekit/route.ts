import { NextRequest, NextResponse } from 'next/server';
import { TokenVerifier, WebhookReceiver } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';
import { bigIntToStringReplacer } from '@/lib/utils';

const receiver = new WebhookReceiver(
  process.env.LIVEKIT_API_KEY!,
  process.env.LIVEKIT_API_SECRET!
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


interface SessionUpdate {
  audio_url?: string;
  audio_status?: string;
  transcript_status?: string;
  duration?: number;
}

interface FileResult {
  filename: string;
  duration?: number;
}

async function updateSession(roomName: string, updateData: SessionUpdate) {
  const uuidMatch = roomName.match(/room_([0-9a-f-]+)/);
  const sessionId = uuidMatch ? uuidMatch[1] : null;

  if (!sessionId) {
    console.error('Failed to extract session ID from room name:', roomName);
    throw new Error('Invalid room name format');
  }

  const { data, error } = await supabase
    .from('sessions')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select();

  console.log('Supabase update result:', JSON.stringify(data, bigIntToStringReplacer), error);
  if (error) throw error;

  return data;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Received webhook body:', body);
    console.log('Authorization header:', authorization);

    const event = await receiver.receive(body, authorization);
    const bodyJson = JSON.parse(body);
    const verifier = new TokenVerifier(  
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!);
    const verify = await verifier.verify(authorization);
    console.log('Verified token:', verify);
 
    // Add a 5-minute tolerance for JWT validation
    const currentTime = Math.floor(Date.now() / 1000);
    const eventTime = Number(event.createdAt);
    
    if (Math.abs(currentTime - eventTime) > 300) { // 5 minutes tolerance
      console.warn('Event timestamp is outside the acceptable range, but processing anyway');
    }

    console.log('Processed event:', JSON.stringify(event, bigIntToStringReplacer));

    if (bodyJson.event === 'egress_ended') {
      const { roomName, status, fileResults } = bodyJson.egressInfo!;
      console.log('Egress ended bodyJson:', { roomName, status, fileResults });
      
      const audioFile = fileResults?.find((file: FileResult) => /\.(ogg|mp3|wav|m4a)$/i.test(file.filename));

      if (audioFile) {
        const { filename: audioFilename, duration } = audioFile;
        console.log('Audio file info:', { audioFilename, duration });

        const durationInSeconds = duration ? Math.floor(Number(duration) / 1e9) : null;

        const updateData: Partial<SessionUpdate> = {
          audio_url: `s3://${process.env.AWS_S3_BUCKET}/${audioFilename}`,
          audio_status: 'completed',
        };

        if (durationInSeconds !== null) {
          updateData.duration = durationInSeconds;
        }

        const data = await updateSession(roomName, updateData);
        return NextResponse.json({ message: 'Session updated successfully', data });
      }
    } else if (bodyJson.event === 'room_finished') {
      console.log('Room finished event received');
      
      const data = await updateSession(bodyJson.room.name, {
        transcript_status: 'completed'
      });

      return NextResponse.json({ message: 'Session transcript status updated successfully', data });
    }

    return NextResponse.json({ message: 'Event processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error && error.message === 'Invalid room name format') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
