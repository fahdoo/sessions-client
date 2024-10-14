import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Number of sessions per page
  const offset = (page - 1) * limit;

  const supabase = createAuthSupabaseClient();

  try {
    const { data: rawSessions, count, error } = await supabase
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
          avatar,
          username
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
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
