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
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        trackRef={audioTrack}
        barCount={5}
        style={{ width: '75vw', height: '300px' }}
      />
    </div>
  );
}
