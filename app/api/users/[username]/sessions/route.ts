import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase/supabase-client';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  console.log('Fetching sessions for username:', params.username);
  const supabase = await createSupabaseClient();
  const { username } = params;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9;
  const offset = (page - 1) * limit;

  try {
    // First, check if the user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user) {
      console.error('User not found for username:', username);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Found user ID:', user.id);

    // Log the query we're about to make
    console.log('Fetching sessions with params:', {
      userId: user.id,
      page,
      offset,
      limit
    });

    const { data: rawSessions, count, error } = await supabase
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
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_public', true)
      .eq('audio_status', 'completed')
      .is('deleted_at', null)
      .not('audio_url', 'is', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    console.log('Found sessions count:', count);
    console.log('Raw sessions:', rawSessions);

    const sessions = camelizeKeys(rawSessions) as Session[];

    return NextResponse.json({
      sessions,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (page * limit) < (count || 0)
    });
  } catch (error) {
    console.error('Error in sessions route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
