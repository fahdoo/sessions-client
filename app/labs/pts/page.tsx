'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { PtsCanvas } from 'react-pts-canvas';
import { Sound, Create, Pt } from 'pts';

export default function PtsTest() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [sound, setSound] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Handle ready state - when canvas is ready
  const handleReady = async (space: any, form: any) => {
    // Don't initialize sound here anymore
    console.log('Canvas ready');
  };

  // Animation function
  const handleAnimate = (space: any, form: any) => {
    try {
      // Clear canvas
      form.fillOnly("#000").rect([[0, 0], [space.size.x, space.size.y]]);

      // Calculate center and radius
      const center = space.center;
      const baseRadius = Math.min(space.size.x, space.size.y) * 0.3;

      // Create base circle
      const pts = Create.radialPts(center, baseRadius, 64);
      
      // Check if we should animate
      if (sound?.playable && isPlaying) {
        console.log('Getting frequency data');
        const frequencies = sound.freqDomain();
        
        if (frequencies?.length) {
          console.log('First few frequencies:', frequencies.slice(0, 5));
          for (let i = 0; i < pts.length; i++) {
            const freqIndex = Math.floor((i / pts.length) * (frequencies.length / 2));
            const magnitude = frequencies[freqIndex] / 255;
            
            const dynamicRadius = baseRadius * (1 + magnitude);
            const dir = pts[i].$subtract(center);
            if (!dir) continue;
            
            const unit = dir.unit();
            if (!unit) continue;
            
            const newPos = center.$add(unit.$multiply(dynamicRadius));
            pts[i].to(newPos, 0.2);
          }
        }
      }

      // Always draw the points
      form.fillOnly("#fff").polygon(pts);

    } catch (error) {
      console.error('Animation error:', error);
    }
  };

  // Initialize sound only when play is clicked
  const handlePlay = async () => {
    try {
      // Initialize sound if not already done
      if (!sound && audioRef.current) {
        console.log('Initializing sound');
        
        // Use Sound.load as shown in their examples
        const s = await Sound.load(audioRef.current);
        console.log('Sound loaded');
        
        await s.analyze(256);
        console.log('Analysis setup');
        
        setSound(s);
      }
      
      // Start analysis
      if (sound) {
        await sound.start();
        console.log('Sound analysis started');
      }
      
      setIsPlaying(true);
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const handlePause = () => {
    try {
      if (sound) {
        console.log('Stopping sound analysis');
        sound.stop();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Pause error:', error);
    }
  };

  const handleEnded = () => {
    try {
      if (sound) {
        console.log('Sound ended');
        sound.stop();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('End error:', error);
    }
  };

  return (
    <div className="p-8 space-y-4">
      <div className="max-w-md overflow-hidden bg-black" style={{ aspectRatio: '9/16' }}>
        <PtsCanvas
          background="#000"
          onReady={handleReady}
          onAnimate={handleAnimate}
          style={{ width: '100%', height: '100%' }}
          retina={true}
        />
      </div>
      
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