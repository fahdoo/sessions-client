'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { Play, Pause } from 'lucide-react';
import LoadingIndicator from '@/components/LoadingIndicator';
import { PlayerContext } from '@/components/session/audio/PlayerContext';
import { fetchAudioUrl, setupMediaSession, setupAudioEventListeners } from '@/lib/audioUtils';
import { isSafari, getSafariAudioConfig, getAudioOperationTimeout } from '@/lib/browser-utils';

interface MiniAudioPlayerProps {
  sessionId: string;
  sessionTitle?: string;
  userAvatarUrl?: string | null;
  userName?: string;
}

export function MiniAudioPlayer({ 
  sessionId, 
  sessionTitle = "Session Recording",
  userAvatarUrl,
  userName 
}: MiniAudioPlayerProps) {
  // Ref to store the audio element instance across renders
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Local state for this player's playing status
  const [isPlaying, setIsPlaying] = useState(false);
  // Loading state for UI feedback
  const [loading, setLoading] = useState(false);
  // Global context to manage which audio is currently playing
  const { playingSessionId, setPlayingSessionId } = useContext(PlayerContext);

  const togglePlay = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // First-time initialization
      if (!audioRef.current) {
        const audioUrl = await fetchAudioUrl(sessionId);
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        
        // Set source and type before setting up listeners
        audio.src = audioUrl;
        
        // Update Media Session metadata immediately
        setupMediaSession(audio, {
          title: sessionTitle,
          artist: userName || 'Unknown Artist',
          artwork: userAvatarUrl || undefined
        });
        
        // Use the shared event handler setup after src is set
        setupAudioEventListeners(audio, {
          onPlay: () => {
            setIsPlaying(true);
            setPlayingSessionId(sessionId);
            
            // Refresh media session metadata on play
            setupMediaSession(audio, {
              title: sessionTitle,
              artist: userName || 'Unknown Artist',
              artwork: userAvatarUrl || undefined
            });
          },
          onPause: () => {
            setIsPlaying(false);
            if (playingSessionId === sessionId) {
              setPlayingSessionId(null);
            }
          },
          onEnded: () => {
            setIsPlaying(false);
            setPlayingSessionId(null);
          }
        });

        audioRef.current = audio;
        
        // If another audio is playing, pause it first
        if (playingSessionId && playingSessionId !== sessionId) {
          window.dispatchEvent(new CustomEvent('pause-all-audio', {
            detail: { exceptSessionId: sessionId }
          }));
          setPlayingSessionId(null);
          await new Promise(resolve => setTimeout(resolve, getAudioOperationTimeout()));
        }
        
        // Wait for audio to be ready
        await new Promise((resolve, reject) => {
          const handleCanPlay = () => {
            audio.removeEventListener('canplaythrough', handleCanPlay);
            resolve(undefined);
          };
          const handleError = (e: Event) => {
            audio.removeEventListener('error', handleError);
            reject(new Error(`Audio load failed: ${(e.target as HTMLAudioElement).error?.message}`));
          };
          audio.addEventListener('canplaythrough', handleCanPlay);
          audio.addEventListener('error', handleError);
        });
        
        await audio.play();
        return;
      }

      // Existing audio handling
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
        // If another audio is playing, pause it first
        if (playingSessionId && playingSessionId !== sessionId) {
          window.dispatchEvent(new CustomEvent('pause-all-audio', {
            detail: { exceptSessionId: sessionId }
          }));
          setPlayingSessionId(null);
          await new Promise(resolve => setTimeout(resolve, getAudioOperationTimeout()));
        }
        await audio.play();
      } else {
        audio.pause();
      }

    } catch (error: unknown) {
      console.error('Audio playback error:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        setIsPlaying(false);
        setPlayingSessionId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Add listener for global pause events
  useEffect(() => {
    const handlePauseAll = (event: CustomEvent) => {
      const exceptSessionId = event.detail.exceptSessionId;
      if (exceptSessionId !== sessionId && audioRef.current && !audioRef.current.paused) {
        // console.log('Pausing audio', { sessionId });
        audioRef.current.pause();
      }
    };

    window.addEventListener('pause-all-audio', handlePauseAll as EventListener);
    return () => {
      window.removeEventListener('pause-all-audio', handlePauseAll as EventListener);
    };
  }, [sessionId]);

  // Cleanup effect
  useEffect(() => {
    // Only set up cleanup, don't do anything on mount
    return () => {
      // Only cleanup if this was the playing session
      if (audioRef.current && playingSessionId === sessionId) {
        // console.log('Cleaning up audio and media session');
        audioRef.current.pause();
        setPlayingSessionId(null);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = null;
        }
      }
    };
  }, [sessionId, playingSessionId, setPlayingSessionId]);

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
    </div>
  );
}
