'use client';

import React, { useState, useEffect } from 'react';
import { BarVisualizerBars } from '@/components/visualizer/BarVisualizerBars';
import styles from '@/components/visualizer/AgentVisualizer.module.scss';

const TestVisualizer: React.FC = () => {
  const [volumeBands, setVolumeBands] = useState<number[]>([0.3, 0.25, 0.01, 0.06, 0.003]);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Generate new random volume bands
      const newVolumeBands = Array(5).fill(0).map(() => Math.random());
      setVolumeBands(newVolumeBands);

      // Generate new random highlighted indices
      const newHighlightedIndices = Array(5).fill(0).map((_, i) => i).sort(() => Math.random() - 0.5).slice(0, 2);
      setHighlightedIndices(newHighlightedIndices);
    }, 500); // Update every 500ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bar Visualizer Test</h1>
      <div className="h-[300px] max-w-[90vw] mx-auto">
        <div className={`${styles['audio-bar-visualizer']} w-full h-64 bg-gray-200`}>
          <BarVisualizerBars
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
