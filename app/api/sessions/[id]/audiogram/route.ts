import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getSignedAudioUrl, getSignedUrl } from '@/lib/server';

export interface AudiogramSession {
  id: string;
  title: string;
  audioUrl: string;
  transcriptData?: string;
  duration: number | null;
  user: {
    avatar: string | null;
    username: string | null;
  };
}

interface SessionResponse {
  id: string;
  title: string;
  audio_url: string;
  transcript_url: string | null;
  duration: number;
  user: {
    id: string;
    avatar: string | null;
    username: string | null;
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createAuthSupabaseClient();

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        audio_url,
        transcript_url,
        duration,
        user:users!inner (
          id,
          avatar,
          username
        )
      `)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single() as { data: SessionResponse | null, error: any };

    if (error || !session || !session.audio_url) {
      throw new Error('Session not found or invalid');
    }

    console.log('Audiogram route - Raw session data:', {
      id: session.id,
      hasTranscriptUrl: !!session.transcript_url,
      hasAudioUrl: !!session.audio_url
    });

    // Get signed audio URL
    const signedAudioUrl = await getSignedAudioUrl(session.audio_url);
    console.log('Audiogram route - Got signed audio URL');
    
    // Try to get transcript data
    let transcriptData;
    try {
      const transcriptUrl = session.transcript_url || session.audio_url.replace('.m4a', '.json');
      console.log('Audiogram route - Attempting to fetch transcript from:', transcriptUrl);
      
      const signedTranscriptUrl = await getSignedUrl(transcriptUrl);
      console.log('Audiogram route - Got signed transcript URL:', signedTranscriptUrl);
      
      const response = await fetch(signedTranscriptUrl);
      console.log('Audiogram route - Transcript fetch response:', {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type')
      });
      
      if (response.ok) {
        const json = await response.json();
        transcriptData = JSON.stringify(json);
        console.log('Audiogram route - Successfully parsed transcript data:', {
          dataLength: transcriptData.length,
          sample: transcriptData.substring(0, 100) + '...'
        });
      }
    } catch (error) {
      console.warn('Audiogram route - Failed to fetch transcript:', {
        error,
        sessionId,
        transcriptUrl: session.transcript_url
      });
    }

    const audiogramSession: AudiogramSession = {
      id: session.id,
      title: session.title,
      audioUrl: signedAudioUrl,
      transcriptData,  // Will be undefined if fetch fails
      duration: session.duration,
      user: {
        avatar: session.user.avatar || null,
        username: session.user.username || null
      }
    };
    console.log('Audiogram route - Returning session:', {
      id: audiogramSession.id,
      hasTranscriptData: !!audiogramSession.transcriptData,
      transcriptDataLength: audiogramSession.transcriptData?.length
    });

    return NextResponse.json(audiogramSession);
  } catch (error) {
    console.error('Error fetching session data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session data' },
      { status: 404 }
    );
  }
} 