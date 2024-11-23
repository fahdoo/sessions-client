import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';
import { checkRole } from '@/lib/roles';
import { generateTitle } from '@/lib/ai/generateTitle';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!checkRole('admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { username } = await req.json();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const processUser = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        await writer.write(encoder.encode(JSON.stringify({ error: 'User not found' })));
        return;
      }

      const targetUserId = userData.id;

      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title')
        .eq('user_id', targetUserId);

      if (sessionsError) {
        await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to fetch sessions' })));
        return;
      }

      for (const session of sessions) {
        if (session.title.includes('New Session') || session.title.includes('Untitled Session')) {
          const { data: transcriptData, error: transcriptError } = await supabase
            .from('transcripts')
            .select('transcript')
            .eq('session_id', session.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (transcriptError) {
            console.error(`Error fetching transcript for session ${session.id}:`, transcriptError);
            continue;
          }

          // Skip if transcript is empty or not an array
          if (!transcriptData?.transcript || 
              !Array.isArray(transcriptData.transcript) || 
              transcriptData.transcript.length === 0) {
            continue;
          }

          const transcriptString = JSON.stringify(transcriptData.transcript);
          const newTitle = await generateTitle(transcriptString, session.title);

          if (newTitle !== session.title) {
            const { error: sessionUpdateError } = await supabase
              .from('sessions')
              .update({ title: newTitle })
              .eq('id', session.id);

            if (sessionUpdateError) {
              console.error(`Error updating session title for session ${session.id}:`, sessionUpdateError);
            }

            await writer.write(encoder.encode(JSON.stringify({
              sessionId: session.id,
              oldTitle: session.title,
              newTitle: newTitle
            }) + '\n'));
          }
        }
      }
    } catch (error) {
      console.error('Error updating titles:', error);
      await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to update titles' })));
    } finally {
      await writer.close();
    }
  };

  processUser();

  return new Response(stream.readable, {
    headers: { 'Content-Type': 'application/json' },
  });
}
