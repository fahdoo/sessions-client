import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const renderId = searchParams.get('renderId');

  if (!renderId) {
    return NextResponse.json({ error: 'No renderId provided' }, { status: 400 });
  }

  console.log('Checking status for renderId:', renderId);

  const supabase = await createAuthSupabaseClient();
  const { data: video, error } = await supabase
    .from('videos')
    .select('status, video_url')
    .eq('render_id', renderId)
    .single();

  if (error) {
    console.error('Error fetching video status:', error);
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: video.status,
    videoUrl: video.video_url
  });
} 