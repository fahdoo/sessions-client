import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { camelizeKeys } from 'humps';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createPublicSupabaseClient();
  const { username } = params;

  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !user) {
      console.error('User not found:', username);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        summary,
        duration,
        created_at,
        audio_url,
        audio_status,
        transcript_url,
        transcript_status,
        is_public,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .eq('user_id', user.id)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    const camelizedSessions = camelizeKeys(sessions);
    return NextResponse.json(camelizedSessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
