'use client';

import { Wave } from "@foobar404/wave";
import { useEffect, useRef, useState } from "react";
import { useUser } from '@clerk/nextjs';
import { Noto_Serif } from 'next/font/google';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

type VisualizationType = 'Glob' | 'Wave' | 'Lines' | 'Square';

interface CanvasConfig {
  titlePosition: number;
  titleSize: number;
  globBlur: number;
  globOpacity: number;
  defaultBackground: string;
}

export default function CanvasTest() {
  const { user } = useUser();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveRef = useRef<Wave | null>(null);
  const animationRef = useRef<number>();
  const [type, setType] = useState<VisualizationType>('Glob');
  const [config, setConfig] = useState<CanvasConfig>({
    titlePosition: 80,
    titleSize: 24,
    globBlur: 0,
    globOpacity: 1,
    defaultBackground: ''
  });

  // Initialize Wave.js and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const audio = audioRef.current;
    if (!canvas || !audio) return;

    // Set up canvas for high DPI displays
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize Wave.js
    if (!waveRef.current) {
      waveRef.current = new Wave(audio, canvas);
    }

    // Animation loop
    function draw() {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      if (config.defaultBackground || user?.imageUrl) {
        // Load and draw background image with blur
      }

      // Draw Wave.js visualization
      if (waveRef.current) {
        waveRef.current.clearAnimations();
        waveRef.current.addAnimation(new waveRef.current.animations[type]({
          fillColor: '#FFFFFF',
          lineColor: '#FFFFFF',
          lineWidth: 1,
          count: 45,
          opacity: config.globOpacity,
          // Note: We'll handle blur at the canvas level if needed
        }));
      }

      // Draw title
      ctx.save();
      ctx.font = `${config.titleSize}px ${notoSerif.style.fontFamily}`;
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Canvas Test Session', canvas.width/2, (config.titlePosition/100) * canvas.height);
      ctx.restore();

      // Apply global blur if needed
      if (type === 'Glob' && config.globBlur > 0) {
        ctx.filter = `blur(${config.globBlur}px)`;
      }

      animationRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [type, config, user?.imageUrl]);

  return (
    <div className="p-8 space-y-8">
      {/* Controls */}
      <div className="max-w-md mx-auto space-y-4">
        {/* ... visualization type selector ... */}
        {/* ... config controls ... */}
        <audio 
          ref={audioRef}
          controls
          crossOrigin="anonymous"
          src="/test-audio.mp3"
          className="w-full"
        />
      </div>

      {/* Single Canvas Container */}
      <div className="max-w-md mx-auto">
        <div 
          className="relative bg-slate-900 overflow-hidden rounded-2xl"
          style={{ aspectRatio: '9/16' }}
        >
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
} 