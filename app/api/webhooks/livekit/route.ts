import { NextRequest, NextResponse } from 'next/server';
import { WebhookReceiver } from 'livekit-server-sdk';
import { createClient } from '@supabase/supabase-js';

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
    const event = await receiver.receive(body, authorization);

    if (event.event === 'egress_ended') {
      const { roomName, status, fileResults } = event.egressInfo!;

      if (fileResults[0]) {
        const { filename, duration } = fileResults[0];

        // Update the session in Supabase
        const { data, error } = await supabase
          .from('sessions')
          .update({
            audio_url: `s3://${process.env.AWS_S3_BUCKET}/${filename}`,
            audio_status: 'completed',
            duration,
            updated_at: new Date().toISOString()
          })
          .eq('id', roomName)
          .select();

        if (error) throw error;

        return NextResponse.json({ message: 'Session updated successfully', data });
      }
    }

    return NextResponse.json({ message: 'Event processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}