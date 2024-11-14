'use client';

import { AudioLines } from 'lucide-react';
import { SelectorGroup, type OptionInfo } from '@/components/ui/selector-group';
import { voiceOptions } from '@/lib/voice-options';

export type AgentVoice = 'ash' | 'alloy' | 'echo' | 'sage';

// Convert voiceOptions to match OptionInfo interface
const selectorOptions: Record<AgentVoice, OptionInfo> = Object.entries(voiceOptions).reduce((acc, [key, value]) => ({
  ...acc,
  [key]: {
    id: value.id,
    icon: value.icon,
    label: value.label,
    description: value.description
  }
}), {} as Record<AgentVoice, OptionInfo>);

interface AgentVoiceSelectorProps {
  selectedVoice: AgentVoice;
  onVoiceChange: (voice: AgentVoice) => void;
  className?: string;
}

export function AgentVoiceSelector({ selectedVoice, onVoiceChange, className }: AgentVoiceSelectorProps) {
  return (
    <SelectorGroup
      options={selectorOptions}
      selectedOption={selectedVoice}
      onOptionChange={onVoiceChange}
      className={className}
    />
  );
} 