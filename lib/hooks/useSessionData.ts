import { useState, useEffect } from 'react';
import { TranscriptSegment } from '@/lib/types';

interface SessionData {
  audioUrl?: string;
  transcript?: TranscriptSegment[];
  isLoading: boolean;
  error?: string;
}

export function useSessionData(sessionId: string): SessionData {
  const [data, setData] = useState<SessionData>({
    isLoading: true
  });

  useEffect(() => {
    let mounted = true;

    async function fetchSessionData() {
      try {
        // Fetch both audio URL and transcript in parallel
        const [audioResponse, transcriptResponse] = await Promise.all([
          fetch(`/api/sessions/${sessionId}/audio-url`),
          fetch(`/api/sessions/${sessionId}/transcript`)
        ]);

        if (!mounted) return;

        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio URL: ${audioResponse.statusText}`);
        }
        if (!transcriptResponse.ok) {
          throw new Error(`Failed to fetch transcript: ${transcriptResponse.statusText}`);
        }

        const audioData = await audioResponse.json();
        const transcriptData = await transcriptResponse.json();

        if (!mounted) return;

        setData({
          audioUrl: audioData.url,
          transcript: transcriptData.transcript,
          isLoading: false
        });
      } catch (err) {
        if (!mounted) return;
        setData({
          isLoading: false,
          error: err instanceof Error ? err.message : 'Failed to load session data'
        });
      }
    }

    fetchSessionData();

    return () => {
      mounted = false;
    };
  }, [sessionId]);

  return data;
} 