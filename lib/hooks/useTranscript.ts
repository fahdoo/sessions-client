import { useState, useCallback, useEffect } from 'react';
import { TranscriptionSegment, Participant } from 'livekit-client';
import { Session, TranscriptState, TranscriptSegment } from '@/lib/types';

export function useTranscript(sessionId: string) {
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

  // Fetch transcript through API route instead of direct Supabase call
  useEffect(() => {
    async function fetchTranscript() {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/sessions/${sessionId}/transcript`);
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }

        const data = await response.json();
        if (data.transcript) {
          setTranscript(prev => ({
            ...prev,
            transcript: data.transcript
          }));
        }
      } catch (error) {
        console.error('Error fetching transcript:', error);
        setError('Failed to fetch transcript');
      }
    }

    fetchTranscript();
  }, [sessionId]);

  const updateTranscript = useCallback((
    segments: TranscriptionSegment[],
    participant: Participant
  ) => {
    setTranscript(prev => {
      // Add participant if not already in metadata
      const participants = prev.metadata.participants;
      if (!participants.find(p => p.identity === participant.identity)) {
        participants.push({
          id: participant.identity || '',
          name: participant.name
        });
      }

      // Add new segments
      const updatedTranscript = [...prev.transcript];
      segments.forEach(segment => {
        // Convert TranscriptionSegment to TranscriptSegment
        const transcriptSegment: TranscriptSegment = {
          ...segment,
          participantId: participant.identity || '',
          isFinal: segment.final || false
        };

        const existingIndex = updatedTranscript.findIndex(s => s.id === segment.id);
        if (existingIndex >= 0) {
          updatedTranscript[existingIndex] = transcriptSegment;
        } else {
          updatedTranscript.push(transcriptSegment);
        }
      });

      return {
        ...prev,
        metadata: {
          ...prev.metadata,
          participants
        },
        transcript: updatedTranscript
      };
    });
  }, []);

  const saveTranscript = useCallback(async (session: Session, isCompleted = false) => {
    if (!transcript.transcript || !sessionId) {
      console.warn('No transcript data to save');
      return;
    }

    console.log('Saving transcript:', transcript.transcript);

    try {
      // Send transcript update to API
      const response = await fetch(`/api/sessions/${sessionId}/transcript`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          transcript: transcript.transcript,
          isCompleted
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }

      // Only do S3 upload if session is completed
      if (isCompleted) {
        const s3Response = await fetch(`/api/sessions/${sessionId}/transcript/s3`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            transcript: transcript.transcript
          }),
        });

        if (!s3Response.ok) {
          console.error('Failed to save transcript to S3');
          // Don't throw - we've already saved to DB
        }
      }

    } catch (error) {
      console.error('Error in saveTranscript:', error);
      setError('Failed to save transcript');
      throw error;
    }
  }, [transcript.transcript, sessionId]);

  // Add periodic saving
  useEffect(() => {
    if (!sessionId || !transcript.transcript.length) return;

    const saveInterval = setInterval(async () => {
      try {
        const session: Partial<Session> = { id: sessionId };
        await saveTranscript(session as Session, false);
        console.log('Periodic transcript save completed');
      } catch (error) {
        console.error('Error in periodic transcript save:', error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [sessionId, transcript.transcript, saveTranscript]);

  return { transcript, fullTranscript, updateTranscript, saveTranscript, error };
}
