import { NextResponse, NextRequest } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClerkSupabaseClientSsr()

  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      users (
        id,
        first_name,
        last_name
      )
    `)
    .eq('id', params.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  const userData = session.users;

  const response = {
    id: session.id,
    title: session.title,
    summary: session.summary,
    audioUrl: session.audio_url,
    user: userData ? {
      userId: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
    } : null,
  };

  return NextResponse.json(response);
}