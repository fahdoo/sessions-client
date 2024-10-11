import { NextRequest, NextResponse } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 9; // Number of sessions per page
  const search = searchParams.get('search') || '';
  const offset = (page - 1) * limit;

  const supabase = createClerkSupabaseClientSsr();

  try {
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
          avatar
        )
      `, { count: 'exact' })
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const { data: rawSessions, count, error } = await query;

    if (error) {
      throw error;
    }

    const sessions = camelizeKeys(rawSessions) as Session[];

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