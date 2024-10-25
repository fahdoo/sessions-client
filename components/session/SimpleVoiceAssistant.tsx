'use client';

import React, { useEffect } from 'react';
import { useVoiceAssistant, AgentState } from '@livekit/components-react';
import { AgentVisualizer } from '@/components/visualizer/AgentVisualizer';

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
        <AgentVisualizer
            state={state}
            trackRef={audioTrack}
            bandCount={5}
            style={{ width: '300px', height: '300px', margin: 'auto' }}
        />
    </div>
  );
}
