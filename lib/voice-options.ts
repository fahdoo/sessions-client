import { AudioLines } from 'lucide-react';
import type { AgentVoice } from '@/components/recording/AgentVoiceSelector';

export const voiceOptions: Record<AgentVoice, {
  id: AgentVoice;
  icon: typeof AudioLines;
  label: string;
  description: string;
  voiceId: string;
}> = {
  ash: {
    id: 'ash',
    icon: AudioLines,
    label: 'Ash',
    description: 'Natural and warm voice with a conversational tone',
    voiceId: 'nova'
  },
  alloy: {
    id: 'alloy',
    icon: AudioLines,
    label: 'Alloy',
    description: 'Clear and balanced voice with a neutral tone',
    voiceId: 'alloy'
  },
  echo: {
    id: 'echo',
    icon: AudioLines,
    label: 'Echo',
    description: 'Resonant and expressive voice with dynamic range',
    voiceId: 'echo'
  },
  sage: {
    id: 'sage',
    icon: AudioLines,
    label: 'Sage',
    description: 'Mature and authoritative voice with a thoughtful tone',
    voiceId: 'onyx'
  }
} as const; 