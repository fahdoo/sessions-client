'use client';

import { useEffect, useRef } from 'react';
import { VisualizerProps } from '../types';
import { init, animateTimbre } from '@/lib/musicolors';

export function MusicolorsVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  barColor,
  config
}: VisualizerProps) {
  useEffect(() => {
    if (!canvas) return;

    // Initialize with the original implementation
    init();
    animateTimbre();

    return () => {
      // Cleanup will be handled by the original implementation
    };
  }, [canvas]);

  return null; // Canvas is handled by the original implementation
} 