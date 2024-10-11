import { useState, useEffect } from 'react';
import { convertS3UrlToHttps } from '@/lib/utils';

interface AudioPlayerProps {
  sessionId: string;
}

export function AudioPlayer({ sessionId }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (!sessionId) {
        setStatus('error');
        setErrorMessage("Session ID is missing");
        return;
      }
      try {
        console.log(`AudioPlayer: Fetching audio URL for session ${sessionId}`);
        const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 202) {
            setStatus('loading');
            setErrorMessage("Audio processing in progress");
          } else {
            throw new Error(data.error || response.statusText);
          }
        } else {
          console.log("AudioPlayer: Fetched audio URL =", data.url);
          if (!data.url) {
            throw new Error("No URL returned from the server");
          }
          const httpsUrl = convertS3UrlToHttps(data.url);
          console.log("AudioPlayer: Converted HTTPS URL =", httpsUrl);
          setAudioUrl(httpsUrl);
          setStatus('ready');
        }
      } catch (error) {
        console.error('Error fetching audio URL:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
      }
    };

    fetchAudioUrl();
  }, [sessionId]);

  if (status === 'loading') {
    return <div>{errorMessage || 'Loading audio...'}</div>;
  }

  if (status === 'error') {
    return <div>Error: {errorMessage}</div>;
  }

  if (!audioUrl) {
    return <div>No audio available</div>;
  }

  return (
    <audio controls className="w-full" controlsList="nodownload">
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}