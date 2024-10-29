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

  // Add this new effect to handle audio ended event
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        setIsPlaying(false);
        setPlayingSessionId(null);
      };

      audioRef.current.addEventListener('ended', handleEnded);
      return () => audioRef.current?.removeEventListener('ended', handleEnded);
    }
  }, [audioRef.current, setPlayingSessionId]);

  const togglePlay = async () => {
    try {
      if (!audioUrl) {
        setLoading(true);
        const url = await fetchAudioUrl(sessionId);
        setAudioUrl(url);
        
        // Create new audio element with error handling
        if (!audioRef.current) {
          audioRef.current = new Audio();
          
          // Add error handler
          audioRef.current.onerror = (e) => {
            console.error('Audio error:', e);
            setErrorMessage('Failed to play audio. Please try again.');
            setIsPlaying(false);
            setLoading(false);
          };
        }
        
        audioRef.current.src = url;
        
        try {
          // First, try to load the audio
          await audioRef.current.load();
          // Then attempt to play
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
            setPlayingSessionId(sessionId);
          }
        } catch (playError) {
          console.error('Playback error:', playError);
          throw new Error('Unable to play audio on this device');
        }
      } else {
        if (audioRef.current) {
          if (isPlaying) {
            audioRef.current.pause();
            setPlayingSessionId(null);
            setIsPlaying(false);
          } else {
            try {
              const playPromise = audioRef.current.play();
              if (playPromise !== undefined) {
                await playPromise;
                setIsPlaying(true);
                setPlayingSessionId(sessionId);
              }
            } catch (playError) {
              console.error('Playback error:', playError);
              throw new Error('Unable to play audio on this device');
            }
          }
        }
      }
    } catch (error) {
      console.error('Toggle play error:', error);
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
