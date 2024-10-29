'use client';

import { useState, useEffect } from 'react';
import { convertS3UrlToHttps } from '@/lib/utils';
import LoadingIndicator from '@/components/LoadingIndicator'; // Import the loading component
import WaveformPlayer from '@/components/session/WaveformPlayer';
import { Card } from '@/components/ui/card';

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
        console.log('Fetching audio URL for session:', sessionId);
        const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
        const data = await response.json();

        console.log('Audio URL response:', {
          status: response.status,
          data
        });

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
        } else if (response.ok && data.url) {
          const httpsUrl = convertS3UrlToHttps(data.url);
          console.log('Converted audio URL:', httpsUrl);
          
          // Test if the audio URL is accessible
          try {
            const audioTest = await fetch(httpsUrl, { method: 'HEAD' });
            if (!audioTest.ok) {
              throw new Error('Audio file not accessible');
            }
            setAudioUrl(httpsUrl);
            setStatus('ready');
          } catch (audioError) {
            console.error('Audio accessibility test failed:', audioError);
            throw new Error('Unable to access audio file');
          }
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

  return (
    <Card className="bg-slate-800/50 rounded-xl p-4 border-0 relative">  
        {status === 'loading' || status === 'processing' ? (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-zinc-800/75 backdrop-blur-md z-10">
          <LoadingIndicator message={status === 'loading' ? 'Loading audio...' : 'Processing audio...'} />
        </div>
      ) : null}

      {status === 'error' && (
        <div className="text-red-500">Error: {errorMessage}</div>
      )}

      {status === 'ready' && audioUrl ? (
        <WaveformPlayer audioUrl={audioUrl} />
      ) : (
        <div>No audio available</div>
      )}
    </Card>
  );
}
