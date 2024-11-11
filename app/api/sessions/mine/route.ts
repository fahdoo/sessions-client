import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '10');
  const hasAudio = url.searchParams.get('hasAudio') === 'true';

  try {
    const supabase = await createAuthSupabaseClient();
    
    let query = supabase
      .from('sessions')
      .select(`
        id,
        user_id,
        title,
        summary,
        duration,
        created_at,
        updated_at,
        is_public,
        audio_url,
        audio_status,
        transcript_url,
        transcript_status,
        system_prompt,
        learnings,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (hasAudio) {
      query = query.not('audio_url', 'is', null);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error('Error fetching sessions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
