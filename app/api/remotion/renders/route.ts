import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAuthSupabaseClient();
  
  try {
    const { data: renders, error } = await supabase
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
          title,
          user_id
        )
      `)
      .eq('session.user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json(renders || []);
  } catch (error) {
    console.error('Error fetching renders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch renders' },
      { status: 500 }
    );
  }
} 