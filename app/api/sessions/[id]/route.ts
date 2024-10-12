import { NextResponse, NextRequest } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  const supabase = createPublicSupabaseClient();

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        id,
        user_id,
        title,
        summary,
        duration,
        created_at,
        is_public,
        audio_url,
        audio_status,
        user:users (
          id,
          first_name,
          last_name,
          avatar
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if the session is public or if the user owns the session
    if (!session.is_public && session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const camelizedSession = camelizeKeys(session);

    return NextResponse.json(camelizedSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createAuthSupabaseClient();

  try {
    const updates = await request.json();
    console.log('Received updates:', updates);

    // Check if the session exists and belongs to the user
    const { data: existingSession, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingSession) {
      console.log('Session not found or does not belong to user');
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Prepare update data
    const { title, summary, is_public } = updates;
    const updateData: Partial<{
      title?: string;
      summary?: string;
      is_public?: boolean;
    }> = {};
    if (title !== undefined && title !== existingSession.title) updateData.title = title;
    if (summary !== undefined && summary !== existingSession.summary) updateData.summary = summary;
    if (is_public !== undefined && is_public !== existingSession.is_public) updateData.is_public = is_public;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      console.log('No changes to update');
      return NextResponse.json(camelizeKeys(existingSession));
    }

    console.log('Updating session with data:', updateData);

    const { data: updatedSessionData, error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Database update failed', details: updateError }, { status: 500 });
    }

    if (!updatedSessionData) {
      console.log('No updated session data returned');
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    const sessionData = camelizeKeys(updatedSessionData) as Session;
    console.log('Updated session data:', sessionData);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}
