import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';
import { checkRole } from '@/lib/roles';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { generateTitle } from '@/lib/ai/generateTitle';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

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
        .select('id, title, transcript_url')
        .eq('user_id', targetUserId);

      if (sessionsError) {
        await writer.write(encoder.encode(JSON.stringify({ error: 'Failed to fetch sessions' })));
        return;
      }

      for (const session of sessions) {
        if (session.transcript_url) {
          const s3Key = session.transcript_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');
          const getCommand = new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET!,
            Key: s3Key,
          });

          const response = await s3Client.send(getCommand);
          const transcriptString = await response.Body?.transformToString();

          if (transcriptString) {
            const newTitle = await generateTitle(transcriptString, session.title);

            // Only update if the title has changed
            if (newTitle !== session.title) {
              const { error: sessionUpdateError } = await supabase
                .from('sessions')
                .update({ title: newTitle })
                .eq('id', session.id);

              if (sessionUpdateError) {
                console.error(`Error updating session title for session ${session.id}:`, sessionUpdateError);
              }
            }

            // Stream the result for this session
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
