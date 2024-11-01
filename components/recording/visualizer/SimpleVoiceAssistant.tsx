'use client';

import React, { useEffect } from 'react';
import { useVoiceAssistant, AgentState } from '@livekit/components-react';
import { AgentVisualizer } from '@/components/recording/visualizer/AgentVisualizer';

interface SimpleVoiceAssistantProps {
  onStateChange?: (state: AgentState) => void;
}

export function SimpleVoiceAssistant({ onStateChange }: SimpleVoiceAssistantProps) {
  const assistant = useVoiceAssistant();

  useEffect(() => {
    if (onStateChange) {
      onStateChange(assistant?.state || 'disconnected');
    }
  }, [assistant?.state, onStateChange]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <AgentVisualizer
        state={assistant?.state}
        trackRef={assistant?.audioTrack}
        className="w-full h-full"
      />
    </div>
  );
}
