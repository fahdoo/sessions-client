'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  init, 
  animateTimbre, 
  cleanup,
  playAudio,
  pauseAudio,
  stopAudio
} from '@/lib/musicolors';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function MusicolorsLab() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const initAttemptRef = useRef(0);
  const isInitializedRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const handlePlayPause = async () => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = async () => {
    stopAudio();
    setIsPlaying(false);
    await loadMusicolors();
  };

  const loadMusicolors = async () => {
    try {
      console.log('Starting Musicolors setup...');
      
      if (!canvasRef.current) {
        const canvas = document.createElement('canvas');
        canvas.id = 'canvas';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        containerRef.current?.appendChild(canvas);
        canvasRef.current = canvas;
      }

      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const success = await init('/test-audio.mp3');
      
      if (success) {
        isInitializedRef.current = true;
        animateTimbre();
        setIsLoading(false);
      } else if (initAttemptRef.current < 3) {
        initAttemptRef.current++;
        setTimeout(loadMusicolors, 100);
      } else {
        throw new Error('Failed to initialize after multiple attempts');
      }

    } catch (err) {
      console.error('Error in loadMusicolors:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visualization');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    loadMusicolors();

    return () => {
      if (isInitializedRef.current) {
        cleanup();
        isInitializedRef.current = false;
      }
      if (canvasRef.current && containerRef.current) {
        containerRef.current.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Musicolors Test</h1>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div 
          ref={containerRef}
          id="canvas-container"
          className="w-full h-[600px] relative bg-slate-900 rounded-lg overflow-hidden"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center text-white">
              Loading visualization...
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            variant="outline"
            size="icon"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 