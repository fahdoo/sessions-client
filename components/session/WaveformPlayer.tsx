'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingIndicator from '@/components/LoadingIndicator';
import { setupMediaSession, setupAudioEventListeners } from '@/lib/audioUtils';

interface WaveformPlayerProps {
  audioUrl: string;
  avatarUrl?: string;
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

    // Cleanup previous instance
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

      // Use setupAudioEventListeners from audioUtils
      setupAudioEventListeners(wavesurfer.current.getMediaElement(), {
        onPlay: () => {
          setIsPlaying(true);
        },
        onPause: () => {
          setIsPlaying(false);
        },
        onEnded: () => {
          setIsPlaying(false);
        }
      });

      // Set up MediaSession when wavesurfer is ready
      wavesurfer.current.on('ready', () => {
        if (wavesurfer.current && !abortControllerRef.current?.signal.aborted) {
          setDuration(wavesurfer.current.getDuration());
          setIsLoading(false);
          
          // Setup MediaSession after wavesurfer is ready
          setupMediaSession(wavesurfer.current.getMediaElement(), {
            title,
            artist,
            artwork: avatarUrl
          });
        }
      });

      wavesurfer.current.on('audioprocess', () => {
        const currentTime = wavesurfer.current?.getCurrentTime() || 0;
        setCurrentTime(currentTime);
      });

    } catch (error) {
      console.error('Error initializing WaveSurfer:', error);
      setIsLoading(false);
    }
  }, [audioUrl, title, artist, avatarUrl]);

  useEffect(() => {
    initializeWaveSurfer();

    return () => {
      // Cleanup on unmount or when audioUrl changes
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
        const playPromise = wavesurfer.current.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
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
    wavesurfer.current.seekTo((currentTime + seconds) / duration);
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
