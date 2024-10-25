'use client';

import React, { useEffect } from 'react';
import { useVoiceAssistant, AgentState } from '@livekit/components-react';
import { BarVisualizer } from '@/components/visualizer/AgentVisualizer';

interface SimpleVoiceAssistantProps {
  onStateChange: (state: AgentState | null) => void;
}

export function SimpleVoiceAssistant({ onStateChange }: SimpleVoiceAssistantProps) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);

  return (
    <div className="h-[360px] w-[360px] mx-auto">
        <BarVisualizer
            state={state}
            trackRef={audioTrack}
            barCount={5}
            style={{ width: '300px', height: '300px', margin: 'auto' }}
        />
    </div>
  );
}
