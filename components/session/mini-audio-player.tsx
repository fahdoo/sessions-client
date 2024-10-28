'use client';

import { useState, useRef, useContext, useEffect } from 'react';
import { fetchAudioUrl } from '@/lib/audioUtils';
import { Play, Pause } from 'lucide-react';
import LoadingIndicator from '@/components/LoadingIndicator';
import { AudioContext } from '@/components/session/session-feed';

interface MiniAudioPlayerProps {
  sessionId: string;
}

export function MiniAudioPlayer({ sessionId }: MiniAudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Reference to the audio element
  const { playingSessionId, setPlayingSessionId } = useContext(AudioContext);

  // Add effect to pause when another session starts playing
  useEffect(() => {
    if (playingSessionId !== sessionId && isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [playingSessionId, sessionId]);

  const togglePlay = async () => {
    try {
      if (!audioUrl) {
        setLoading(true);
        const url = await fetchAudioUrl(sessionId);
        setAudioUrl(url);
        
        // Create and load the audio element
        if (!audioRef.current) {
          audioRef.current = new Audio(url);
        } else {
          audioRef.current.src = url;
        }
        
        // Wait for the audio to be loaded before playing
        await audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        setPlayingSessionId(sessionId);
      } else {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setPlayingSessionId(null);
          } else {
            await audioRef.current.play();
            setPlayingSessionId(sessionId);
          }
          setIsPlaying(!isPlaying);
        }
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={togglePlay} 
        className={`w-10 h-10 flex items-center justify-center rounded-full ${
          isPlaying 
            ? 'bg-sky-600 hover:bg-sky-700 animate-pulse-light' 
            : 'bg-blue-500/20 hover:bg-blue-500/40'
        } text-white transition-colors`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <LoadingIndicator size={20} />
          </div>
        ) : isPlaying ? (
          <Pause size={24} />
        ) : (
          <Play size={24} />
        )}
      </button>

      {errorMessage && (
        <div className="text-red-500 ml-2">Error: {errorMessage}</div>
      )}
    </div>
  );
}
