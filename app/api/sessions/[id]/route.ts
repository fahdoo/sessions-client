import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';
import { getSignedUrl } from '@/lib/server-utils';

type SessionWithSignedUrl = Session & {
  signedAudioUrl?: string;
};

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/sessions/[id] route hit', {
    id: params.id,
    url: request.url
  });
  
  const auth = getAuth(request);
  const userId = auth?.userId;
  const supabase = await createSupabaseClient();

  try {
    console.log('Supabase query params:', {
      sessionId: params.id,
      userId,
      timestamp: new Date().toISOString()
    });

    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        id,
        user_id,
        title,
        summary,
        duration,
        created_at,
        updated_at,
        is_public,
        audio_url,
        audio_status,
        transcript_url,
        transcript_status,
        system_prompt,
        learnings,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Supabase error details:', {
        error,
        message: error.message,
        code: error.code,
        hint: error.hint,
        query: {
          table: 'sessions',
          id: params.id,
          userId
        },
        timestamp: new Date().toISOString()
      });
      
      const status = error.code === 'PGRST116' ? 404 : 500;
      return NextResponse.json(
        { 
          error: 'Database error', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status }
      );
    }

    if (!session) {
      console.log('Session not found:', {
        id: params.id,
        timestamp: new Date().toISOString()
      });
      return new NextResponse(
        JSON.stringify({ error: 'Session not found', id: params.id }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Session found:', {
      id: session.id,
      userId: session.user_id,
      isPublic: session.is_public,
      timestamp: new Date().toISOString()
    });

    // Authorization check
    const isAuthorized = session.is_public || (userId && session.user_id === userId);
    console.log('Authorization check:', {
      isPublic: session.is_public,
      sessionUserId: session.user_id,
      requestUserId: userId,
      isAuthorized,
      timestamp: new Date().toISOString()
    });

    if (!isAuthorized) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized access to session' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Generate signed URL for audio file if it exists
    let signedUrl: string | undefined;
    if (session.audio_url) {
      try {
        signedUrl = await getSignedUrl(session.audio_url);
        const camelizedSession = camelizeKeys(session) as Session;
        (camelizedSession as SessionWithSignedUrl).signedAudioUrl = signedUrl;
        return NextResponse.json(camelizedSession);
      } catch (signedUrlError) {
        console.error('Error generating signed URL:', {
          error: signedUrlError,
          audioUrl: session.audio_url,
          timestamp: new Date().toISOString()
        });
      }
    }

    const responseData = session.audio_url 
      ? camelizeKeys({ ...session, signedAudioUrl: signedUrl })
      : camelizeKeys(session);

    return new NextResponse(
      JSON.stringify(responseData),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unexpected error in session fetch:', {
      error,
      params,
      timestamp: new Date().toISOString()
    });
    
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseClient();
  
  try {
    const data = await request.json();
    
    // Convert the field names to snake_case for Supabase
    const updateData = {
      title: data.title,
      summary: data.summary,
      is_public: data.isPublic,
      learnings: data.learnings,
    };

    const { data: session, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating session:', error);
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(camelizeKeys(session));
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
