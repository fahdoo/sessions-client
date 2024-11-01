'use client';

import { useState, useEffect } from 'react';
import { convertS3UrlToHttps } from '@/lib/utils';
import LoadingIndicator from '@/components/LoadingIndicator';
import WaveformPlayer from '@/components/session/audio/WaveformPlayer';
import { Card } from '@/components/ui/card';
import ErrorBoundary from '@/components/ui/error-boundary';

interface AudioPlayerProps {
  sessionId: string;
  sessionTitle: string;
  userAvatarUrl?: string | null;
  userName: string;
}

export function AudioPlayer({ sessionId, sessionTitle, userAvatarUrl, userName }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'processing' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      // Clear any existing media session data first
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = null;
      }

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
          // Poll for audio status every 30 seconds
          const intervalId = setInterval(async () => {
            const pollResponse = await fetch(`/api/sessions/${sessionId}/audio-url`);
            const pollData = await pollResponse.json();
            if (pollResponse.ok && pollData.url) {
              clearInterval(intervalId);
              const httpsUrl = convertS3UrlToHttps(pollData.url);
              
              // // Test audio accessibility in development
              // if (process.env.NODE_ENV === 'development') {
              //   const isAccessible = await testAudioUrl(httpsUrl);
              //   console.log('Audio accessibility test result:', isAccessible);
              // }
              
              setAudioUrl(httpsUrl);
              setStatus('ready');
            } else if (pollResponse.status !== 202) {
              clearInterval(intervalId);
              throw new Error(pollData.error || pollResponse.statusText);
            }
          }, 10000);
        } else if (response.ok && data.url) {
          const httpsUrl = convertS3UrlToHttps(data.url);
          setAudioUrl(httpsUrl);
          setStatus('ready');
        } else {
          throw new Error(data.error || response.statusText);
        }
      } catch (error) {
        console.error('Error initializing audio:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    initAudio();
  }, [sessionId]);

  return (
    <ErrorBoundary>
      <Card className="bg-slate-400/50 backdrop-blur-md rounded-xl p-4 border-0 relative">  
        {status === 'loading' || status === 'processing' ? (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-zinc-800/75 backdrop-blur-md z-10">
            <LoadingIndicator message={status === 'loading' ? 'Loading audio...' : 'Processing audio...'} />
          </div>
        ) : null}

        {status === 'error' && (
          <div className="text-red-500">Error: {errorMessage}</div>
        )}

        {status === 'ready' && audioUrl ? (
          <WaveformPlayer 
            audioUrl={audioUrl} 
            avatarUrl={userAvatarUrl}
            title={sessionTitle}
            artist={userName}
          />
        ) : (
          <div>No audio available</div>
        )}
      </Card>
    </ErrorBoundary>
  );
}
