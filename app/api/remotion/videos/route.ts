import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const sessionId = searchParams.get('sessionId');

  try {
    const supabase = await createAuthSupabaseClient();
    
    // Build query - specify the relationship to use with !videos_session_id_fkey
    const query = supabase
      .from('videos')
      .select(`
        id,
        session_id,
        render_id,
        format,
        status,
        video_url,
        width,
        height,
        created_at,
        updated_at,
        session:sessions!videos_session_id_fkey (
          id,
          title,
          user_id
        )
      `)
      .eq('session.user_id', userId)
      .order('created_at', { ascending: false });

    // Add session filter if provided
    if (sessionId) {
      query.eq('session_id', sessionId);
    }

    const { data: videos, error } = await query;

    if (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Videos fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
} 