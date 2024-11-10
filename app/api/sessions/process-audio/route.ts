import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';
import { startAuphonicProcessing } from '@/lib/utils/auphonic';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, audioUrl } = await req.json();
    console.log('Processing audio for session:', { sessionId, audioUrl });
    
    const supabase = createServiceRoleSupabaseClient();
    
    // Get session details and current status
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('title, user_id, audio_status, auphonic_uuid')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Verify ownership
    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if already processing
    if (session.audio_status === 'processing' && session.auphonic_uuid) {
      console.log('Session already processing:', { 
        status: session.audio_status, 
        auphonicUuid: session.auphonic_uuid 
      });
      return NextResponse.json({ 
        message: 'Processing already in progress',
        auphonicUuid: session.auphonic_uuid
      });
    }

    console.log('Starting Auphonic processing for session:', {
      sessionId,
      title: session.title
    });

    // Start Auphonic processing
    const auphonicUuid = await startAuphonicProcessing(audioUrl, session.title || 'Untitled Session');
    console.log('Auphonic processing started:', { auphonicUuid });

    // Update session with Auphonic UUID and status
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        auphonic_uuid: auphonicUuid,
        audio_status: 'processing',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session:', updateError);
      throw updateError;
    }

    console.log('Session updated successfully:', {
      sessionId,
      auphonicUuid,
      status: 'processing'
    });

    return NextResponse.json({ 
      message: 'Processing started',
      auphonicUuid 
    });

  } catch (error) {
    console.error('Error starting audio processing:', error);
    return NextResponse.json(
      { error: 'Failed to start processing', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 