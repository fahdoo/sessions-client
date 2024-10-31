'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingIndicator from '@/components/LoadingIndicator';
import { setupMediaSession, setupAudioEventListeners } from '@/lib/audioUtils';

interface WaveformPlayerProps {
  audioUrl: string;
  avatarUrl?: string | null;
  title?: string;
  artist?: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  avatarUrl = '/default-avatar.png',
  title = 'Session Recording',
  artist = 'Unknown Artist',
  barWidth = 4,
  barGap = 4,
  barRadius = 4,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const initializeWaveSurfer = useCallback(() => {
    if (!waveformRef.current || !audioUrl) return;

    if (wavesurfer.current) {
      wavesurfer.current.destroy();
      wavesurfer.current = null;
    }

    try {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#475569',
        progressColor: '#93c5fd',
        url: audioUrl,
        barWidth,
        barGap,
        barRadius,
        cursorWidth: 0,
        height: 80,
        normalize: true,
        backend: 'MediaElement',
        mediaControls: false,
        autoplay: false,
      });

      const mediaElement = wavesurfer.current.getMediaElement();

      wavesurfer.current.on('ready', () => {
        if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
          setupMediaSession(mediaElement, {
            title,
            artist,
            artwork: avatarUrl || undefined
          });
          setDuration(wavesurfer.current.getDuration());
          setIsLoading(false);
        }
      });

      wavesurfer.current.on('play', () => {
        console.log('play event triggered');
        setIsPlaying(true);
      });

      wavesurfer.current.on('pause', () => {
        console.log('pause event triggered');
        setIsPlaying(false);
      });

      wavesurfer.current.on('finish', () => {
        console.log('finish event triggered');
        setIsPlaying(false);
      });

      mediaElement.addEventListener('play', () => {
        console.log('media element play');
        setIsPlaying(true);
      });

      mediaElement.addEventListener('pause', () => {
        console.log('media element pause');
        setIsPlaying(false);
      });

      wavesurfer.current.on('audioprocess', () => {
        if (wavesurfer.current) {
          setCurrentTime(wavesurfer.current.getCurrentTime());
        }
      });

      // Update MediaSession seek handler
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && wavesurfer.current) {
            const duration = wavesurfer.current.getDuration();
            if (duration > 0) {
              const seekPosition = details.seekTime / duration;
              wavesurfer.current.seekTo(seekPosition);
              setCurrentTime(details.seekTime);
            }
          }
        });

        // Add seek backward/forward handlers
        navigator.mediaSession.setActionHandler('seekbackward', () => {
          skip(-10);
        });

        navigator.mediaSession.setActionHandler('seekforward', () => {
          skip(10);
        });
      }

    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
      setIsLoading(false);
    }
  }, [audioUrl, title, artist, avatarUrl]);

  useEffect(() => {
    initializeWaveSurfer();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
        wavesurfer.current = null;
      }
    };
  }, [initializeWaveSurfer]);

  const togglePlayPause = async () => {
    if (!wavesurfer.current) return;

    try {
      if (!isPlaying) {
        await wavesurfer.current.play();
      } else {
        wavesurfer.current.pause();
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const skip = (seconds: number) => {
    if (!wavesurfer.current) return;
    const currentTime = wavesurfer.current.getCurrentTime();
    const duration = wavesurfer.current.getDuration();
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    
    wavesurfer.current.seekTo(newTime / duration);
    
    // Update MediaSession position state
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      navigator.mediaSession.setPositionState({
        duration: duration,
        position: newTime,
        playbackRate: wavesurfer.current.getPlaybackRate(),
      });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col mt-3">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/75 backdrop-blur-md z-10">
          <LoadingIndicator message="Loading audio..." />
        </div>
      )}
      <div ref={waveformRef} className="w-full" />
      <div className="flex justify-between text-sm sm:text-base text-slate-500 dark:text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center items-center space-x-4 mt-2">
        <Button onClick={() => skip(-10)} variant="ghost" size="icon" className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-slate-200 dark:bg-zinc-200/90 text-slate-700 dark:text-zinc-700 hover:bg-slate-300 dark:hover:bg-zinc-100/90">
          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
        </Button>
        <Button onClick={() => skip(10)} variant="ghost" size="icon" className="h-8 w-8">
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WaveformPlayer;
