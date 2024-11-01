'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { Play, Pause } from 'lucide-react';
import LoadingIndicator from '@/components/LoadingIndicator';
import { PlayerContext } from '@/components/session/audio/PlayerContext';
import { 
  fetchAudioUrl, 
  setupMediaSession, 
  setupAudioEventListeners,
  checkAudioSupport 
} from '@/lib/audioUtils';
import { isSafari, getAudioOperationTimeout } from '@/lib/browser-utils';
import { useMediaSession } from './MediaSessionContext';
import { AudioPlayButton } from './AudioPlayButton';

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const { playingSessionId, setPlayingSessionId } = useContext(PlayerContext);
  const { updateMediaSession } = useMediaSession();

  const togglePlay = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // First-time initialization
      if (!audioRef.current) {
        const audioUrl = await fetchAudioUrl(sessionId);
        const audio = new Audio();
        
        // Set basic properties
        audio.preload = 'auto';
        audio.crossOrigin = 'anonymous';

        // Set source first
        audio.src = audioUrl;
        audioRef.current = audio;

        // Add media session event listeners
        audio.addEventListener('mediaSessionPlay', () => {
          console.log('Media session play triggered');
          audio.play().catch(error => {
            console.error('Media session play failed:', error);
          });
        });

        audio.addEventListener('mediaSessionPause', () => {
          console.log('Media session pause triggered');
          audio.pause();
        });

        // Now set up event listeners
        setupAudioEventListeners(audio, {
          onPlay: () => {
            console.log('play event triggered');
            setIsPlaying(true);
            setPlayingSessionId(sessionId);
            setLoading(false);
            
            // Update media session on play
            updateMediaSession({
              mediaElement: audio,
              title: sessionTitle,
              artist: userName || 'Unknown Artist',
              artwork: userAvatarUrl ? [
                {
                  src: userAvatarUrl,
                  sizes: '96x96',
                  type: 'image/png'
                }
              ] : undefined
            });
          },
          onPause: () => {
            console.log('pause event triggered');
            setIsPlaying(false);
            setLoading(false);
            if (playingSessionId === sessionId) {
              setPlayingSessionId(null);
            }
          },
          onEnded: () => {
            setIsPlaying(false);
            setPlayingSessionId(null);
            setLoading(false);
          }
        });

        // If another audio is playing, pause it
        if (playingSessionId && playingSessionId !== sessionId) {
          window.dispatchEvent(new CustomEvent('pause-all-audio', {
            detail: { exceptSessionId: sessionId }
          }));
          setPlayingSessionId(null);
          await new Promise(resolve => setTimeout(resolve, getAudioOperationTimeout()));
        }

        try {
          await audio.play();
        } catch (error) {
          console.error('Play failed:', error);
          setLoading(false);
          throw error;
        }
        return;
      }

      // Existing audio handling
      const audio = audioRef.current;
      if (!audio) return;

      if (audio.paused) {
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
      const support = checkAudioSupport();
      console.error('Audio playback error:', error, {
        audioSupport: support
      });
      setLoading(false);
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
    return () => {
      if (audioRef.current && playingSessionId === sessionId) {
        audioRef.current.pause();
        setPlayingSessionId(null);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = null;
        }
      }
    };
  }, [sessionId, playingSessionId, setPlayingSessionId]);

  // Add cleanup for media session event listeners
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.removeEventListener('mediaSessionPlay', () => {});
        audio.removeEventListener('mediaSessionPause', () => {});
      }
    };
  }, []);

  return (
    <div className="flex items-center">
      <AudioPlayButton
        isPlaying={isPlaying}
        loading={loading}
        onClick={togglePlay}
        size="md"
      />
    </div>
  );
}
