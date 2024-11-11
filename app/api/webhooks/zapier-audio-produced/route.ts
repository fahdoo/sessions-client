import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';

export async function PUT(request: NextRequest) {
  try {
    // Verify the Zapier webhook key
    const zapierWebhookSecret = request.headers.get('Zapier-Webhook-Secret');
    if (zapierWebhookSecret !== process.env.ZAPIER_WEBHOOK_SECRET) {
      console.error('Invalid Zapier webhook key');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Log the received data
    console.log('Received Zapier webhook data:', {
      modified: body.modified,
      filename: body.filename,
      filepath: body.filepath
    });

    // Create a Supabase client with service role
    const supabase = createServiceRoleSupabaseClient();

    // Extract the session ID from the filename
    // Filename format: room_[session_id]-[timestamp]-post
    const sessionId = extractSessionId(body.filename);

    if (!sessionId) {
      throw new Error('Invalid filename format: Unable to extract session ID');
    }

    // First, fetch the current session data
    const { data: currentSession, error: fetchError } = await supabase
      .from('sessions')
      .select('audio_url')
      .eq('id', sessionId)
      .single();

    if (fetchError) throw fetchError;

    // Update the session in the database
    const { data, error } = await supabase
      .from('sessions')
      .update({ 
        original_audio_url: currentSession.audio_url,
        audio_url: body.filepath,
        updated_at: body.modified
      })
      .eq('id', sessionId);

    if (error) throw error;

    console.log('Updated session:', data);

    return NextResponse.json({ message: 'Session updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error processing Zapier webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function extractSessionId(filename: string): string | null {
  const match = filename.match(/^room_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/);
  return match ? match[1] : null;
}
