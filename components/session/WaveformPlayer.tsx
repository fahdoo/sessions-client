'use client';

import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingIndicator from '@/components/LoadingIndicator';

interface WaveformPlayerProps {
  audioUrl: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  barWidth = 4,
  barGap = 4,
  barRadius = 4,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      console.log('Starting WaveSurfer initialization...');
      setIsLoading(true);

      // First test if audio can be played
      const testAudio = new Audio();
      testAudio.src = audioUrl;

      testAudio.addEventListener('canplaythrough', () => {
        console.log('Audio can be played, initializing WaveSurfer');
        
        // Initialize WaveSurfer only after we confirm audio can be played
        wavesurfer.current = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: '#475569',
          progressColor: '#93c5fd',
          url: audioUrl,
          barWidth,
          barGap,
          barRadius,
          cursorWidth: 0,
          height: 80,
          normalize: true,
          // Add backend options for better mobile support
          backend: 'MediaElement',
          mediaControls: false,
          autoplay: false,
        });

        wavesurfer.current.on('ready', () => {
          console.log('WaveSurfer ready');
          setDuration(wavesurfer.current!.getDuration());
          setIsLoading(false);
        });

        wavesurfer.current.on('error', (error) => {
          console.error('WaveSurfer error:', error);
          setIsLoading(false);
        });

        wavesurfer.current.on('play', () => {
          console.log('WaveSurfer play event');
          setIsPlaying(true);
        });

        wavesurfer.current.on('pause', () => {
          console.log('WaveSurfer pause event');
          setIsPlaying(false);
        });
      });

      testAudio.addEventListener('error', (e) => {
        console.error('Audio test failed:', e);
        setIsLoading(false);
        // Handle the error appropriately
      });

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }
      };
    }
  }, [audioUrl, barWidth, barGap, barRadius]);

  const togglePlayPause = async () => {
    if (wavesurfer.current) {
      try {
        // On mobile, we need to handle play() as a promise
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
        // Show user-friendly error message
        // You might want to add a state for error messages and display it in the UI
      }
    }
  };

  const skip = (seconds: number) => {
    if (wavesurfer.current) {
      wavesurfer.current.skip(seconds);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col mt-3">
      {isLoading && ( // Show loading state overlay
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
