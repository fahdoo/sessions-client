import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { camelizeKeys } from 'humps';

// TODO: fix this; postgres/supabase how to make count on aggregate
export async function GET(request: NextRequest) {
  const supabase = createPublicSupabaseClient();

  try {
    const { data: users, error } = await supabase.rpc('get_users_with_session_counts', {
      limit_count: 6
    });

    if (error) throw error;

    return NextResponse.json(camelizeKeys(users));
  } catch (error) {
    console.error('Error fetching recommended users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
