import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { getSignedUrl } from '@/lib/server-utils';

export async function HEAD(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return new NextResponse(null, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createAuthSupabaseClient();

  try {
    // Verify session ownership and get audio URL
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('audio_url, user_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Error fetching session:', sessionError);
      return new NextResponse(null, { status: 404 });
    }

    if (session.user_id !== userId) {
      return new NextResponse(null, { status: 403 });
    }

    if (!session.audio_url) {
      return new NextResponse(null, { status: 404 });
    }

    // Get signed URL
    const signedUrl = await getSignedUrl(session.audio_url);

    // Return headers that would be present for the audio file
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'audio/ogg',
        'Content-Length': '0', // We don't actually need the content
        'Access-Control-Allow-Origin': '*',
      }
    });

  } catch (error) {
    console.error('Error in audio URL test:', error);
    return new NextResponse(null, { status: 500 });
  }
} 