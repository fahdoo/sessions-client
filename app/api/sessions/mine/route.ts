import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createClerkSupabaseClientSsr();

  try {
    const { data: rawSessions, error } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const sessions = camelizeKeys(rawSessions) as Session[];

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}