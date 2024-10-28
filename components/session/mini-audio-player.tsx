'use client';

import { useState, useRef } from 'react';
import { fetchAudioUrl } from '@/lib/audioUtils';
import { Play, Pause } from 'lucide-react';
import LoadingIndicator from '@/components/LoadingIndicator';

interface MiniAudioPlayerProps {
  sessionId: string;
}

export function MiniAudioPlayer({ sessionId }: MiniAudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Reference to the audio element

  const togglePlay = async () => {
    if (!audioUrl) {
      setLoading(true);
      try {
        const url = await fetchAudioUrl(sessionId);
        setAudioUrl(url);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }

    if (audioUrl) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying((prev) => !prev);
    }
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={togglePlay} 
        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500/10 hover:bg-blue-500/30 text-white"
      >
        {loading ? (
          <LoadingIndicator message="Loading..." /> // Show loading indicator
        ) : isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} />
        )}
      </button>

      {errorMessage && (
        <div className="text-red-500">Error: {errorMessage}</div>
      )}

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} />
      )}
    </div>
  );
}
