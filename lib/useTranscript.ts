import { useState, useCallback } from 'react';
import { TranscriptionSegment, Participant } from 'livekit-client';
import { Session } from '@/lib/types';

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
    setTranscript(currentTranscript => {
      if (!currentTranscript || !session) {
        console.warn('Cannot save transcript: transcript or session is null');
        return currentTranscript;
      }

      // Calculate the overall start and end times
      const validTimestamps = currentTranscript.transcript
        .map(t => t.startTime)
        .filter(time => isFinite(time) && !isNaN(time));

      const startTime = validTimestamps.length > 0 ? Math.min(...validTimestamps) : Date.now() / 1000;
      const endTime = validTimestamps.length > 0 ? Math.max(...validTimestamps) : Date.now() / 1000;

      const transcriptToSave = {
        ...currentTranscript,
        metadata: {
          ...currentTranscript.metadata,
          startTime: new Date(startTime * 1000).toISOString(),
          endTime: new Date(endTime * 1000).toISOString(),
        }
      };

      console.log('Saving transcript. Transcript segments:', transcriptToSave.transcript.length);
    //   console.log('Full transcript length:', transcriptToSave.transcript.map(t => t.text).join(' ').length);
    //   console.log('Full transcript:', transcriptToSave.transcript.map(t => t.text).join(' '));

      fetch(`/api/sessions/${session.id}/transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptToSave, isCompleted }),
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to save transcript');
          }
          console.log('Transcript saved successfully');
        })
        .catch(error => {
          console.error('Error saving transcript:', error);
        });

      return currentTranscript;
    });
  }, []);

  return { transcript, fullTranscript, updateTranscript, saveTranscript };
}
