import { NextResponse, NextRequest } from 'next/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClerkSupabaseClientSsr()

  // Fetch the session to get the audio file path
  const { data: session, error } = await supabase
    .from('sessions')
    .select('audio_url, user_id')
    .eq('id', params.id)
    .single();

  if (error || !session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Check if the user has permission to access this audio
  const { data: { user } } = await supabase.auth.getUser();
  if (session.user_id !== user?.id) {
    // TODO: Implement proper visibility check
    // For now, we'll assume all sessions are public
  }

  // Generate a signed URL for the audio file
  const { data: signedUrl, error: signedUrlError } = await supabase
    .storage
    .from('session-audio')
    .createSignedUrl(session.audio_url, 3600); // URL valid for 1 hour

  if (signedUrlError) {
    return NextResponse.json({ error: 'Failed to generate audio URL' }, { status: 500 });
  }

  // Redirect to the signed URL
  return NextResponse.redirect(signedUrl.signedUrl);
}