'use client';

import { useState, useEffect } from 'react';
import { convertS3UrlToHttps } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import WaveformPlayer from '@/components/session/WaveformPlayer';

interface AudioPlayerProps {
  sessionId: string;
}

export function AudioPlayer({ sessionId }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'processing' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (!sessionId) {
        setStatus('error');
        setErrorMessage("Session ID is missing");
        return;
      }
      try {
        const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
        const data = await response.json();

        if (response.status === 202) {
          setStatus('processing');
          setErrorMessage(data.message || "Audio processing in progress");
          // Poll for audio status every 5 seconds
          const intervalId = setInterval(async () => {
            const pollResponse = await fetch(`/api/sessions/${sessionId}/audio-url`);
            const pollData = await pollResponse.json();
            if (pollResponse.ok && pollData.url) {
              clearInterval(intervalId);
              const httpsUrl = convertS3UrlToHttps(pollData.url);
              setAudioUrl(httpsUrl);
              setStatus('ready');
            } else if (pollResponse.status !== 202) {
              clearInterval(intervalId);
              throw new Error(pollData.error || pollResponse.statusText);
            }
          }, 5000);
        } else if (response.ok) {
          const httpsUrl = convertS3UrlToHttps(data.url);
          setAudioUrl(httpsUrl);
          setStatus('ready');
        } else {
          throw new Error(data.error || response.statusText);
        }
      } catch (error) {
        console.error('Error fetching audio URL:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    fetchAudioUrl();
  }, [sessionId]);

  if (status === 'loading' || status === 'processing') {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
        <p>{status === 'loading' ? 'Loading audio...' : 'Processing audio...'}</p>
      </div>
    );
  }

  if (status === 'error') {
    return <div className="text-red-500">Error: {errorMessage}</div>;
  }

  if (!audioUrl) {
    return <div>No audio available</div>;
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
      <WaveformPlayer audioUrl={audioUrl} />
    </div>
  );
}
