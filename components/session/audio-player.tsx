import { useState, useEffect } from 'react';
import { convertS3UrlToHttps } from '@/lib/utils';

interface AudioPlayerProps {
  sessionId: string;
}

export function AudioPlayer({ sessionId }: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudioUrl = async () => {
      if (!sessionId) {
        console.error("AudioPlayer: sessionId is undefined");
        return;
      }
      try {
        const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
        if (!response.ok) throw new Error('Failed to fetch audio URL');
        const data = await response.json();
        console.log("AudioPlayer: Fetched audio URL =", data.signedUrl);
        setAudioUrl(convertS3UrlToHttps(data.signedUrl));
      } catch (error) {
        console.error('Error fetching audio URL:', error);
      }
    };

    fetchAudioUrl();
  }, [sessionId]);

  if (!audioUrl) {
    return <div>Loading audio...</div>;
  }

  return (
    <audio controls className="w-full" controlsList="nodownload">
      <source src={audioUrl} type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
  );
}