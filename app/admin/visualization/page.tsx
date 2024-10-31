'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AgentVisualizerBands } from '@/components/recording/visualizer/AgentVisualizerBands';
import { TestControlBar } from '@/components/recording/visualizer/TestControlBar';
import { TranscriptionDrawer } from '@/components/transcription/TranscriptionDrawer';
import styles from '@/components/recording/visualizer/AgentVisualizer.module.scss';

// Mock transcript data
const mockTranscript = [
  {
    id: '1',
    participantId: 'user-123',
    text: 'Hello, how are you today?',
    startTime: 1000,
    endTime: 2000,
    language: 'en',
    isFinal: true,
  },
  {
    id: '2',
    participantId: 'agent-123',
    text: 'I am doing well, thank you for asking. How can I help you today?',
    startTime: 2100,
    endTime: 3000,
    language: 'en',
    isFinal: true,
  },
  {
    id: '3',
    participantId: 'user-123',
    text: 'I wanted to discuss a new project idea.',
    startTime: 3100,
    endTime: 4000,
    language: 'en',
    isFinal: true,
  },
];

const TestVisualizer: React.FC = () => {
  const [volumeBands, setVolumeBands] = useState<number[]>([0.3, 0.25, 0.01, 0.06, 0.003]);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [mockState, setMockState] = useState<'listening' | 'speaking' | 'thinking'>('listening');

  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 200;

  useEffect(() => {
    const updateValues = (time: number) => {
      if (time - lastUpdateTime.current >= updateInterval) {
        const newVolumeBands = Array(5).fill(0).map(() => Math.random() * 0.4);
        setVolumeBands(newVolumeBands);
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
    <div className="h-full flex flex-col">
      <div className="h-[calc(100vh-0px)] flex items-center justify-center -mt-[72px]">
        <div className="relative h-[360px] w-[360px]">
          <div className={`${styles['audio-band-visualizer']} absolute inset-0 flex items-center justify-center`}>
            <AgentVisualizerBands
              volumeBands={volumeBands}
              highlightedIndices={highlightedIndices}
              minHeight={20}
              maxHeight={100}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4">
        <div className="bg-slate-800/90 backdrop-blur-sm rounded-full">
          <TestControlBar
            onEnd={() => console.log('End clicked')}
            transcriptComponent={
              <TranscriptionDrawer
                currentTitle="Test Session"
                transcript={mockTranscript}
                userName="John Doe"
                userAvatar="/default-avatar.png"
              />
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TestVisualizer;
