import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase/supabase-client';
import { getSignedUrl } from '@/lib/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  const sessionId = params.id;
  const url = new URL(req.url);
  const forProcessing = url.searchParams.get('forProcessing') === 'true';

  try {
    const supabase = await createSupabaseClient();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('audio_url, original_audio_url, audio_status, user_id, is_public')
      .eq('id', sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.is_public && (!userId || session.user_id !== userId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let audioUrl: string | null = null;

    if (forProcessing) {
      // For processing, always use original_audio_url if available, otherwise use audio_url
      audioUrl = session.original_audio_url || session.audio_url;
      console.log('Audio URL for processing:', {
        originalUrl: session.original_audio_url,
        audioUrl: session.audio_url,
        selected: audioUrl
      });
    } else {
      // For playback, always use the processed audio_url
      audioUrl = session.audio_url;
      console.log('Audio URL for playback:', {
        audioUrl
      });
    }

    if (!audioUrl) {
      return NextResponse.json({ message: 'No audio URL available' }, { status: 404 });
    }

    const signedUrl = await getSignedUrl(audioUrl);
    return NextResponse.json({ url: signedUrl });

  } catch (error) {
    console.error('Error fetching audio URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
