import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getAuth } from '@clerk/nextjs/server';
import { convertAudioToMp3 } from '@/lib/utils/audio-conversion';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = getAuth(request);
    const { userId } = auth;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerComponentClient({ cookies });

    // Get the session
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('audio_url, user_id')
      .eq('id', params.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.user_id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.audio_url) {
      return NextResponse.json({ error: 'No audio file found' }, { status: 404 });
    }

    // Convert the audio
    const mp3Blob = await convertAudioToMp3(session.audio_url);

    // Upload to Supabase Storage
    const fileName = `audio-produced/${params.id}.mp3`;
    const { error: uploadError } = await supabase.storage
      .from('sessions_audio')
      .upload(fileName, mp3Blob, {
        contentType: 'audio/mp3',
        upsert: true
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get the public URL for the new file
    const { data: publicUrlData } = supabase.storage
      .from('sessions_audio')
      .getPublicUrl(fileName);

    // Update the session with new audio URLs
    const { error: updateError } = await supabase
      .from('sessions')
      .update({
        original_audio_url: session.audio_url,
        audio_url: publicUrlData.publicUrl,
        audio_status: 'processed'
      })
      .eq('id', params.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      audioUrl: publicUrlData.publicUrl
    });

  } catch (error) {
    console.error('Error converting audio:', error);
    return NextResponse.json(
      { error: 'Error processing audio' },
      { status: 500 }
    );
  }
} 