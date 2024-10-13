import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

console.log('Public sessions route file loaded');

export async function GET(request: NextRequest) {
  console.log('GET request received in public sessions route');

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Number of sessions per page
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  console.log(`Query params: page=${page}, limit=${limit}, search=${search}, offset=${offset}`);

  try {
    console.log('Building Supabase query');
    const supabase = createPublicSupabaseClient();
    let query = supabase
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
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    console.log('Executing Supabase query');
    const { data: rawSessions, count, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    console.log(`Query results: ${rawSessions?.length} sessions found, total count: ${count}`);

    const sessions = camelizeKeys(rawSessions) as Session[];

    console.log('Sending response');
    return NextResponse.json({
      sessions,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (error) {
    console.error('Error fetching public sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
