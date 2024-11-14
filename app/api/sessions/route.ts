import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import { camelizeKeys } from 'humps';
import { createRoom } from '@/lib/livekit';
import { generateRoomName } from '@/lib/utils';
import { AudioLines, type LucideIcon } from 'lucide-react';
import type { AgentVoice } from '@/components/recording/AgentVoiceSelector';
import { voiceOptions } from '@/lib/voice-options';

interface VoiceOption {
  id: AgentVoice;
  icon: LucideIcon;
  label: string;
  description: string;
  voiceId: string;
}

// Add a type guard
function isValidVoice(voice: string): voice is AgentVoice {
  return ['ash', 'alloy', 'echo', 'sage'].includes(voice);
}

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createAuthSupabaseClient();
  
  // Fetch user's personal info
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('info')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user data:', userError);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }

  const { title, topics, agentVariant = 'calm', agentVoice = 'ash', isPublic = true } = await request.json();
  
  // Validate voice
  if (!isValidVoice(agentVoice)) {
    return NextResponse.json(
      { error: 'Invalid voice selection' },
      { status: 400 }
    );
  }

  // Now TypeScript knows agentVoice is valid
  const selectedVoice = voiceOptions[agentVoice];
  
  // Convert newline-separated topics into array, filtering out empty lines
  const topicsArray = topics
    .split('\n')
    .map((topic: string) => topic.trim())
    .filter((topic: string) => topic);
  
  try {
    // Insert the session with topics array
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        title,
        user_id: userId,
        topics: topicsArray,
        system_prompt: null,
        audio_status: 'pending',
        transcript_status: 'pending',
        agent_variant: agentVariant,
        agent_voice: agentVoice,
        is_public: isPublic
      })
      .select(`
        id,
        title,
        user_id,
        topics,
        system_prompt,
        audio_status,
        transcript_status,
        agent_variant,
        agent_voice,
        created_at,
        user:users (
          id,
          first_name,
          last_name,
          avatar,
          username
        )
      `)
      .single();

    if (sessionError) {
      console.error('Supabase error:', sessionError);
      throw sessionError;
    }

    // Fetch recent sessions with summaries, excluding the current session
    const { data: recentSessions, error: recentSessionsError } = await supabase
      .from('sessions')
      .select('id, title, created_at, summary, learnings')
      .eq('user_id', userId)
      .neq('id', sessionData.id)
      .not('summary', 'is', null)
      .gt('duration', 60)
      .match(isPublic 
        ? { is_public: true }
        : {}
      )
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentSessionsError) {
      console.error('Error fetching recent sessions:', recentSessionsError);
      throw recentSessionsError;
    }

    const sessionDataCamelized = camelizeKeys(sessionData);
    const metadataObject = {
      ...sessionDataCamelized,
      recentSessions: recentSessions?.map((session: {
        id: string;
        title: string;
        created_at: string;
        summary: string;
        learnings: string[];
      }) => ({
        id: session.id,
        title: session.title,
        createdAt: session.created_at,
        summary: session.summary,
        learnings: session.learnings
      })),
      topics: topicsArray,
      agentVariant,
      agentVoice: {
        name: selectedVoice.label,
        id: agentVoice,
        voiceId: selectedVoice.voiceId,
        description: selectedVoice.description
      },
      personalInfo: userData?.info?.map((item: { text: string }) => item.text) || []
    };

    // Log the final metadata for debugging
    console.log('Room metadata voice settings:', {
      voiceId: selectedVoice.voiceId,
      name: selectedVoice.label,
      id: agentVoice
    });

    const metadata = JSON.stringify(metadataObject);
    console.log('Creating LiveKit room with metadata:', metadata);

    // Create the LiveKit room
    const roomName = generateRoomName(sessionData.id);
    console.log('Generated room name:', roomName);
    try {
      await createRoom(roomName, metadata);
    } catch (livekitError) {
      console.error('LiveKit room creation error:', livekitError);
      return NextResponse.json({
        ...sessionDataCamelized,
        livekitError: 'Failed to create LiveKit room'
      });
    }

    return NextResponse.json(sessionDataCamelized);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
