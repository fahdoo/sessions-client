import { Wave } from "@foobar404/wave";
import { useEffect, useRef } from "react";
import { VisualizationType } from '../types';

interface WaveWrapperProps {
  canvas: HTMLCanvasElement;
  audioElement: HTMLAudioElement;
  type: VisualizationType;
  barColor: string;
}

export function WaveWrapper({ 
  canvas, 
  audioElement,
  type,
  barColor,
}: WaveWrapperProps) {
  const wave = useRef<Wave | null>(null);

  // Create Wave instance only once
  useEffect(() => {
    if (!canvas || !audioElement) return;

    // Only create if it doesn't exist
    if (!wave.current) {
      console.log('Creating new Wave instance');
      wave.current = new Wave(audioElement, canvas);
    }

    // Cleanup on unmount only
    return () => {
      if (wave.current) {
        wave.current.clearAnimations();
        wave.current = null;
      }
    };
  }, [audioElement]); // Only depend on audioElement

  // Handle updates to animation type and color
  useEffect(() => {
    if (!wave.current) return;

    try {
      // Clear existing animations
      wave.current.clearAnimations();

      // Add new animation
      const animation = new wave.current.animations[type]({
        lineColor: barColor,
        fillColor: { gradient: [barColor, `${barColor}33`] },
        count: 64
      });

      wave.current.addAnimation(animation);
      console.log('Updated animation:', type);
    } catch (error) {
      console.error('Wave.js animation error:', error);
    }
  }, [type, barColor]); // Only update when type or color changes

  return null;
} 