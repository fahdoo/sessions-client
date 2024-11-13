'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { CanvasSpace, Create, Sound, Group, Pt } from 'pts';
import { Button } from "@/components/ui/button";

export default function PtsTest() {
  const containerRef = useRef<HTMLDivElement>(null);
  const spaceRef = useRef<CanvasSpace | null>(null);
  const soundRef = useRef<any>(null);
  const formRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio and visualization
  const initializeAudio = async () => {
    if (!containerRef.current || isInitialized) return;

    try {
      // Create canvas space with explicit size
      const space = new CanvasSpace(containerRef.current);
      const dpr = window.devicePixelRatio || 1;
      space.setup({
        bgcolor: '#000',
        resize: true,
        retina: true
      });
      spaceRef.current = space;
      const form = space.getForm();
      formRef.current = form;

      // Initialize sound properly
      const sound = await Sound.load(audioRef.current!);
      await sound.analyze(256); // Wait for analyzer setup
      soundRef.current = sound;

      // Animation loop
      space.add({
        animate: () => {
          if (!sound?.playable || !form) return;

          try {
            // Clear canvas
            form.fillOnly("#000").rect([[0, 0], [space.size.x, space.size.y]]);

            // Get frequency data
            const frequencies = sound.freqDomain();
            if (!frequencies?.length) return;

            // Calculate base radius (15% of smaller dimension)
            const baseRadius = Math.min(space.size.x, space.size.y) * 0.15;
            const center = space.center;

            // Create more points for smoother circle
            const pts = Create.radialPts(center, baseRadius, 64); // Increased from 32 to 64 points
            
            // Update points based on frequency
            for (let i = 0; i < pts.length; i++) {
              // Map point index to frequency range with overlap for smoothing
              const freqIndex = Math.floor((i / pts.length) * (frequencies.length / 2));
              
              // Get surrounding frequencies for smoothing
              const prevFreq = frequencies[freqIndex - 1] || frequencies[freqIndex];
              const currentFreq = frequencies[freqIndex];
              const nextFreq = frequencies[freqIndex + 1] || frequencies[freqIndex];
              
              // Average frequencies for smoother transition
              const smoothedFreq = (prevFreq + currentFreq + nextFreq) / (3 * 255);
              
              // Smoother magnitude calculation
              const magnitude = smoothedFreq * 1.2; // Reduced multiplier for subtler effect
              
              // Calculate new radius with easing
              const dynamicRadius = baseRadius * (1 + magnitude);
              
              // Get direction from center
              const dir = pts[i].$subtract(center);
              if (!dir) continue;
              
              // Calculate new position
              const unit = dir.unit();
              if (!unit) continue;
              
              const newPos = center.$add(unit.$multiply(dynamicRadius));
              pts[i].to(newPos, 0.2); // Increased smoothing time
            }

            // Draw visualization - pure white, no border
            form.fillOnly("rgba(255, 255, 255, 1)").polygon(pts);

          } catch (error) {
            console.error('Animation error:', error);
          }
        }
      });

      // Start animation
      space.play();
      setIsInitialized(true);

    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  // Handle audio events
  const handlePlay = async () => {
    if (!isInitialized) {
      await initializeAudio();
    }
    if (soundRef.current) {
      soundRef.current.start();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (soundRef.current && isPlaying) {
      soundRef.current.stop();
      setIsPlaying(false);
    }
  };

  const handleEnded = () => {
    if (soundRef.current) {
      soundRef.current.stop();
      setIsPlaying(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current = null;
        }
        if (spaceRef.current?.isPlaying) {
          spaceRef.current.stop();
          spaceRef.current.removeAll();
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, []);

  return (
    <div className="p-8 space-y-4">
      <div 
        ref={containerRef} 
        className="max-w-md overflow-hidden bg-black"
        style={{ 
          aspectRatio: '9/16',
        }}
      />
      
      <audio 
        ref={audioRef}
        controls
        crossOrigin="anonymous"
        src="/test-audio.mp3"
        className="w-full max-w-md"
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
      />
    </div>
  );
} 