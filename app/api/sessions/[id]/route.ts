import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/supabase-client';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';

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
    // Get session details first
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        summary,
        learnings,
        duration,
        is_public,
        audio_url,
        audio_status,
        transcript_status,
        transcript_url,
        auphonic_uuid,
        created_at,
        updated_at,
        user_id,
        user:users(
          id,
          username,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('id', params.id)
      .is('deleted_at', null)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check authorization - allow access if:
    // 1. Session is public OR
    // 2. User owns the session
    const isAuthorized = session.is_public || (userId && session.user_id === userId);
    
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Camelize the response data
    const camelizedSession = camelizeKeys(session);
    return NextResponse.json(camelizedSession);

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createAuthSupabaseClient();

  try {
    // First, verify the user owns this session
    const { data: session, error: fetchError } = await supabase
      .from('sessions')
      .select('id, user_id')
      .eq('id', sessionId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!session || session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Perform soft delete by updating deleted_at
    const { error: deleteError } = await supabase
      .from('sessions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Session deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
