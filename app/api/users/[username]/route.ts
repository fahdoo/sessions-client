import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = createPublicSupabaseClient();
  const { username } = params;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Number of sessions per page
  const offset = (page - 1) * limit;

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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const sessions = camelizeKeys(rawSessions) as Session[];

    return NextResponse.json({
      sessions,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      hasMore: (page * limit) < (count || 0)
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
