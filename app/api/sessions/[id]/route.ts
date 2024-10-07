import { NextResponse, NextRequest } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  const supabase = createClerkSupabaseClientSsr();

  try {
    const { data: rawSessionData, error } = await supabase
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

    if (!rawSessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if the session is public or belongs to the authenticated user
    if (!rawSessionData.is_public && rawSessionData.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const sessionData = camelizeKeys(rawSessionData) as Session;

    return NextResponse.json(sessionData);
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
  const supabase = createClerkSupabaseClientSsr();

  try {
    const updates = await request.json();
    console.log('Received updates:', updates);

    // Explicitly define the fields to update
    const { title, summary, is_public } = updates;
    const updateData = {
      title,
      summary,
      is_public,
      // Add any other fields you want to update
    };

    console.log('Updating session with data:', updateData);

    const { data: rawSessionData, error } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Database update failed', details: error }, { status: 500 });
    }

    if (!rawSessionData) {
      console.log('No session data returned');
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    const sessionData = camelizeKeys(rawSessionData) as Session;
    console.log('Updated session data:', sessionData);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}