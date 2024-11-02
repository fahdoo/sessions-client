import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { getSignedUrl } from '@/lib/server-utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/sessions/[id]/audio-url route hit', params.id);
  const { userId } = getAuth(req);
  const sessionId = params.id;

  try {
    const supabase = await createSupabaseClient();
    const { data: session, error } = await supabase
      .from('sessions')
      .select('audio_url, audio_status, user_id, is_public')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session) {
      console.log('Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (!session.is_public && (!userId || session.user_id !== userId)) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (session.audio_status === 'processing' || !session.audio_url) {
      console.log('Audio processing in progress or no audio URL');
      return NextResponse.json({ message: 'Audio processing in progress' }, { status: 202 });
    }

    const signedUrl = await getSignedUrl(session.audio_url);

    console.log('Signed URL generated successfully');
    return NextResponse.json(
      { url: signedUrl },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Expose-Headers': 'Content-Length, Content-Range',
        }
      }
    );
  } catch (error: unknown) {
    console.error('Error fetching audio URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal server error', details: errorMessage }, { status: 500 });
  }
}
