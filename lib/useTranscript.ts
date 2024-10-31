import { useState, useCallback, useEffect } from 'react';
import { TranscriptionSegment, Participant } from 'livekit-client';
import { Session } from '@/lib/types';
import { useSupabase } from '@/lib/hooks/useSupabase';

type TranscriptState = {
  metadata: {
    sessionId: string;
    startTime: string;
    endTime: string;
    participants: Participant[];
  };
  transcript: Array<{
    id: string;
    participantId: string;
    text: string;
    startTime: number;
    endTime: number;
    language: string;
    isFinal: boolean;
  }>;
};

export function useTranscript(sessionId: string) {
  const supabase = useSupabase();
  const [transcript, setTranscript] = useState<TranscriptState>({
    metadata: {
      sessionId,
      startTime: new Date().toISOString(),
      endTime: '',
      participants: []
    },
    transcript: []
  });

  const [fullTranscript, setFullTranscript] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Add effect to fetch existing transcript
  useEffect(() => {
    async function fetchTranscript() {
      if (!sessionId) return;

      try {
        // First verify session ownership and get status
        const { data: sessionData, error: sessionError } = await supabase
          .from('sessions')
          .select('user_id, transcript_status')
          .eq('id', sessionId)
          .single();

        if (sessionError) {
          console.error('Error verifying session ownership:', sessionError);
          setError('Unauthorized access');
          return;
        }

        // Update status to recording if we're fetching during a live session
        if (sessionData.transcript_status === 'pending') {
          await supabase
            .from('sessions')
            .update({ transcript_status: 'recording' })
            .eq('id', sessionId);
        }

        // Try to get from transcripts table first
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('transcripts')
          .select('transcript')
          .eq('session_id', sessionId)
          .single();

        if (transcriptData?.transcript) {
          setTranscript(prev => ({
            ...prev,
            transcript: transcriptData.transcript
          }));
          return;
        }

        // If status is s3_only or we don't have the transcript in the database,
        // try to get from S3
        if (sessionData.transcript_status === 's3_only') {
          const response = await fetch(`/api/sessions/${sessionId}/transcript`);
          if (response.ok) {
            const data = await response.json();
            
            // Save to transcripts table for future use
            const { error: insertError } = await supabase
              .from('transcripts')
              .insert({
                session_id: sessionId,
                transcript: data.transcript
              });

            if (insertError) {
              console.error('Error saving transcript to database:', insertError);
              return;
            }

            // Update status to db_synced
            await supabase
              .from('sessions')
              .update({ transcript_status: 'db_synced' })
              .eq('id', sessionId);

            setTranscript(prev => ({
              ...prev,
              transcript: data.transcript
            }));
          }
        }
      } catch (error) {
        console.error('Error in fetchTranscript:', error);
        setError('Failed to fetch transcript');
      }
    }

    fetchTranscript();
  }, [sessionId, supabase]);

  const updateTranscript = useCallback((newTranscriptSegments: TranscriptionSegment[], participant?: Participant) => {
    // console.log('Received new transcript segments:', newTranscriptSegments);
    if (newTranscriptSegments.length === 0) {
      console.warn('Received empty transcript segments array');
      return;
    }

    setTranscript((prev: TranscriptState) => {
      const updatedTranscript = [...prev.transcript];
      
      newTranscriptSegments.forEach(segment => {
        const existingIndex = updatedTranscript.findIndex(t => t.id === segment.id);
        
        if (existingIndex !== -1) {
          updatedTranscript[existingIndex] = {
            ...updatedTranscript[existingIndex],
            text: segment.text,
            startTime: segment.startTime / 1000,
            endTime: segment.endTime / 1000,
            language: segment.language,
            isFinal: segment.final
          };
        } else {
          updatedTranscript.push({
            id: segment.id,
            participantId: participant?.identity || 'unknown',
            text: segment.text,
            startTime: segment.startTime / 1000,
            endTime: segment.endTime / 1000,
            language: segment.language,
            isFinal: segment.final
          });
        }
      });

      // Update full transcript
      const newFullTranscript = updatedTranscript
        .sort((a, b) => a.startTime - b.startTime)
        .map(segment => segment.text)
        .join(' ');
      setFullTranscript(newFullTranscript);

    //   console.log('Updated transcript length:', updatedTranscript.length);
    //   console.log('Updated full transcript length:', newFullTranscript.length);
    //   console.log('Full transcript:', newFullTranscript);

      return {
        ...prev,
        transcript: updatedTranscript
      };
    });
  }, []);

  const saveTranscript = useCallback(async (session: Session, isCompleted = false) => {
    if (!transcript.transcript || !sessionId) return;

    try {
      // First update status to processing
      await supabase
        .from('sessions')
        .update({ transcript_status: 'processing' })
        .eq('id', sessionId);

      // Save to S3 as backup
      const response = await fetch(`/api/sessions/${sessionId}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcript.transcript, isCompleted }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript to S3');
      }

      // Update status to s3_only temporarily
      await supabase
        .from('sessions')
        .update({ transcript_status: 's3_only' })
        .eq('id', sessionId);

      // Save to transcripts table
      const { error: transcriptError } = await supabase
        .from('transcripts')
        .upsert({
          session_id: sessionId,
          transcript: transcript.transcript
        }, {
          onConflict: 'session_id'
        });

      if (transcriptError) {
        console.error('Error saving transcript to database:', transcriptError);
        throw transcriptError;
      }

      // Update final status based on completion
      const finalStatus = isCompleted ? 'completed' : 'db_synced';
      await supabase
        .from('sessions')
        .update({ transcript_status: finalStatus })
        .eq('id', sessionId);

    } catch (error) {
      console.error('Error saving transcript:', error);
      
      await supabase
        .from('sessions')
        .update({ transcript_status: 'failed' })
        .eq('id', sessionId);

      setError('Failed to save transcript');
    }
  }, [transcript.transcript, sessionId, supabase]);

  return { transcript, fullTranscript, updateTranscript, saveTranscript, error };
}
