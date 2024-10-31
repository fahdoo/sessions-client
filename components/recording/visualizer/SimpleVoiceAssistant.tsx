'use client';

import React, { useEffect } from 'react';
import { useVoiceAssistant, AgentState } from '@livekit/components-react';
import { AgentVisualizer } from '@/components/recording/visualizer/AgentVisualizer';

interface SimpleVoiceAssistantProps {
  onStateChange: (state: AgentState | null) => void;
}

export function SimpleVoiceAssistant({ onStateChange }: SimpleVoiceAssistantProps) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <AgentVisualizer
        state={state}
        trackRef={audioTrack}
        className="w-full h-full"
      />
    </div>
  );
}
