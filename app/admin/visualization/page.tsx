'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AgentVisualizerBands } from '@/components/visualizer/AgentVisualizerBands';
import styles from '@/components/visualizer/AgentVisualizer.module.scss';

const TestVisualizer: React.FC = () => {
  const [volumeBands, setVolumeBands] = useState<number[]>([0.3, 0.25, 0.01, 0.06, 0.003]);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 200; // 200ms interval

  useEffect(() => {
    const updateValues = (time: number) => {
      if (time - lastUpdateTime.current >= updateInterval) {
        const newVolumeBands = Array(5).fill(0).map(() => Math.random() * 0.4);
        setVolumeBands(newVolumeBands);

        // Generate new random highlighted indices
        // const newHighlightedIndices = Array(5).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 2);
        // setHighlightedIndices(newHighlightedIndices);

        lastUpdateTime.current = time;
      }

      animationFrameId.current = requestAnimationFrame(updateValues);
    };

    animationFrameId.current = requestAnimationFrame(updateValues);

    return () => {
      if (animationFrameId.current !== null) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Visualization Test</h1>
      <div className="h-[360px] w-[360px] mx-auto">
        <div className={`${styles['audio-band-visualizer']}`}>
          <AgentVisualizerBands
            volumeBands={volumeBands}
            highlightedIndices={highlightedIndices}
            minHeight={20}
            maxHeight={100}
          />
        </div>
      </div>
    </div>
  );
};

export default TestVisualizer;
