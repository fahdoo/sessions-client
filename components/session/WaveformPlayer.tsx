'use client';

import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, RotateCcw, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaveformPlayerProps {
  audioUrl: string;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
}

const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  barWidth = 3,
  barGap = 3,
  barRadius = 3,
}) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (waveformRef.current && audioUrl) {
      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#334155', // Light mode waveform color (slate-700)
        progressColor: '#93c5fd', // Light mode progress color (blue-300)
        url: audioUrl,
        barWidth,
        barGap,
        barRadius,
        cursorWidth: 0,
        height: 80,
        normalize: true,
      });

      wavesurfer.current.on('ready', () => {
        setDuration(wavesurfer.current!.getDuration());
      });

      wavesurfer.current.on('audioprocess', () => {
        setCurrentTime(wavesurfer.current!.getCurrentTime());
      });

      wavesurfer.current.on('play', () => setIsPlaying(true));
      wavesurfer.current.on('pause', () => setIsPlaying(false));

      // Apply dark mode styles if needed
      if (document.documentElement.classList.contains('dark')) {
        wavesurfer.current.setOptions({
          waveColor: '#52525b', // Dark mode waveform color (zinc-600)
          progressColor: '#60a5fa', // Dark mode progress color (blue-400)
        });
      }

      return () => {
        if (wavesurfer.current) {
          wavesurfer.current.destroy();
        }
      };
    }
  }, [audioUrl, barWidth, barGap, barRadius]);

  const togglePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
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
      <div className="relative">
        <div ref={waveformRef} className="w-full" />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center items-center space-x-4 mt-2">
        <Button onClick={() => skip(-10)} variant="ghost" size="icon" className="h-8 w-8">
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button onClick={togglePlayPause} variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-100 text-slate-700 dark:text-slate-800 hover:bg-slate-300 dark:hover:bg-slate-900">
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
