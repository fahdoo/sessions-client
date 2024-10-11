import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
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

    // Add a 5-minute tolerance for JWT validation
    const currentTime = Math.floor(Date.now() / 1000);
    const eventTime = Number(event.createdAt);
    
    if (Math.abs(currentTime - eventTime) > 300) { // 5 minutes tolerance
      console.warn('Event timestamp is outside the acceptable range, but processing anyway');
    }

    console.log('Processed event:', JSON.stringify(event, bigIntToStringReplacer));

    if (event.event === 'egress_ended') {
      const { roomName, status, fileResults } = event.egressInfo!;
      console.log('Egress ended event:', { roomName, status, fileResults });
      
      const audioFile = fileResults?.find(file => /\.(ogg|mp3|wav|m4a)$/i.test(file.filename));
      if (audioFile) {
        const { filename, duration } = audioFile;
        console.log('Audio file info:', { filename, duration });

        // Extract the UUID from the room name
        const uuidMatch = roomName.match(/room_([0-9a-f-]+)/);
        const sessionId = uuidMatch ? uuidMatch[1] : null;

        if (sessionId) {
          // Convert duration from nanoseconds to seconds
          const durationInSeconds = Math.floor(Number(duration) / 1e9);

          // Update the session in Supabase
          const { data, error } = await supabase
            .from('sessions')
            .update({
              audio_url: `s3://${process.env.AWS_S3_BUCKET}/${filename}`,
              audio_status: 'completed',
              duration: durationInSeconds,
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)
            .select();
          
          console.log('Supabase update result:', JSON.stringify(data, bigIntToStringReplacer), error);
          if (error) throw error;

          return NextResponse.json({ message: 'Session updated successfully', data });
        } else {
          console.error('Failed to extract session ID from room name:', roomName);
          return NextResponse.json({ error: 'Invalid room name format' }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ message: 'Event processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}