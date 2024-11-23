import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';
import { checkRole } from '@/lib/roles';
import { generateSummary } from '@/lib/ai/generateSummary';

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!checkRole('admin')) {
    return new Response('Forbidden', { status: 403 });
  }

  const { username } = await req.json();

  if (!username) {
    return new Response('Username is required', { status: 400 });
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

      // Get sessions that need summaries
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title, summary')
        .eq('user_id', targetUserId);

      if (sessionsError) {
        await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to fetch sessions' })));
        return;
      }

      for (const session of sessions) {
        if (!session.summary || session.summary.trim() === '') {
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

          if (!transcriptData?.transcript || 
              !Array.isArray(transcriptData.transcript) || 
              transcriptData.transcript.length === 0) {
            continue;
          }

          const transcriptString = JSON.stringify(transcriptData.transcript);
          const summary = await generateSummary(transcriptString);
          
          if (summary) {
            const { error: sessionUpdateError } = await supabase
              .from('sessions')
              .update({ summary })
              .eq('id', session.id);

            if (sessionUpdateError) {
              console.error(`Error updating session summary for session ${session.id}:`, sessionUpdateError);
            }

            await writer.write(encoder.encode(JSON.stringify({
              sessionId: session.id,
              sessionTitle: session.title,
              summary
            }) + '\n'));
          }
        }
      }
    } catch (error) {
      console.error('Error generating summaries:', error);
      await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to generate summaries' })));
    } finally {
      await writer.close();
    }
  };

  processUser();

  return new Response(stream.readable, {
    headers: { 'Content-Type': 'application/json' },
  });
} 