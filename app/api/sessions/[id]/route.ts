import { NextResponse, NextRequest } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { createServiceRoleSupabaseClient } from '@/lib/supabase-service-role';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { generateSummary } from '@/lib/summarization';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log('GET /api/sessions/[id] route hit', params.id);
  const { userId } = getAuth(request);
  console.log('User ID from auth:', userId);
  const supabase = createSupabaseClient();
  const serviceRoleSupabase = createServiceRoleSupabaseClient();

  try {
    console.log('Querying Supabase for session:', params.id);
    const { data: session, error } = await supabase
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
        audio_status,
        transcript_url,
        transcript_status,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .eq('id', params.id)
      .single();

    console.log('Supabase query result:', { session, error });

    if (error) {
      console.error('Supabase error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      throw error;
    }

    if (!session) {
      console.log('Session not found');
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if the session is public or if the user owns the session
    console.log('Checking session visibility:', { isPublic: session.is_public, sessionUserId: session.user_id, currentUserId: userId });
    if (!session.is_public && session.user_id !== userId) {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Generate summary if it doesn't exist and there's a transcript
    if (!session.summary && session.transcript_url) {
      console.log('Summary not found. Checking transcript...');
      const s3Key = session.transcript_url.replace('s3://' + process.env.AWS_S3_BUCKET + '/', '');

      // Fetch the transcript from S3
      const getCommand = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
      });

      const response = await s3Client.send(getCommand);
      const transcriptString = await response.Body?.transformToString();

      if (transcriptString && transcriptString.length >= 50) {
        console.log('Transcript is long enough. Generating summary...');
        const summary = await generateSummary(transcriptString);

        if (summary !== null) {
          // Update the session with the new summary using serviceRoleSupabase
          const { error: updateError } = await serviceRoleSupabase
            .from('sessions')
            .update({ summary })
            .eq('id', params.id);

          if (updateError) {
            console.error('Error updating summary:', updateError);
          } else {
            console.log('Summary generated and saved successfully');
            session.summary = summary;
          }
        }
      } else {
        console.log('Transcript is too short for summarization');
      }
    }

    const camelizedSession = camelizeKeys(session);
    console.log('Session fetched successfully');
    return NextResponse.json(camelizedSession);
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createSupabaseClient();

  try {
    const updates = await request.json();
    console.log('Received updates:', updates);

    // Check if the session exists and belongs to the user
    const { data: existingSession, error: fetchError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !existingSession) {
      console.log('Session not found or does not belong to user');
      return NextResponse.json({ error: 'Session not found or unauthorized' }, { status: 404 });
    }

    // Prepare update data
    const { title, summary, is_public } = updates;
    const updateData: Partial<{
      title?: string;
      summary?: string;
      is_public?: boolean;
    }> = {};
    if (title !== undefined && title !== existingSession.title) updateData.title = title;
    if (summary !== undefined && summary !== existingSession.summary) updateData.summary = summary;
    if (is_public !== undefined && is_public !== existingSession.is_public) updateData.is_public = is_public;

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      console.log('No changes to update');
      return NextResponse.json(camelizeKeys(existingSession));
    }

    console.log('Updating session with data:', updateData);

    const { data: updatedSessionData, error: updateError } = await supabase
      .from('sessions')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json({ error: 'Database update failed', details: updateError }, { status: 500 });
    }

    if (!updatedSessionData) {
      console.log('No updated session data returned');
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    const sessionData = camelizeKeys(updatedSessionData) as Session;
    console.log('Updated session data:', sessionData);

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error }, { status: 500 });
  }
}
