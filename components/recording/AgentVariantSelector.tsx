import { Brain, HeartHandshake, HandMetal } from 'lucide-react';
import { SelectorGroup, type OptionInfo } from '@/components/ui/selector-group';

export type AgentVariant = 'deep' | 'calm' | 'fun';

interface AgentVariantSelectorProps {
  selectedVariant: AgentVariant;
  onVariantChange: (variant: AgentVariant) => void;
  className?: string;
}

const VARIANT_INFO: Record<AgentVariant, OptionInfo> = {
  deep: {
    id: 'deep',
    icon: Brain,
    label: 'Deep',
    description: 'A thoughtful companion for exploring big ideas and deep insights.'
  },
  calm: {
    id: 'calm',
    icon: HeartHandshake,
    label: 'Calm',
    description: 'A gentle guide for personal growth and meaningful reflection.'
  },
  fun: {
    id: 'fun',
    icon: HandMetal,
    label: 'Fun',
    description: 'An energetic friend for lively, playful conversations.'
  }
};

export function AgentVariantSelector({ selectedVariant, onVariantChange, className }: AgentVariantSelectorProps) {
  return (
    <SelectorGroup
      options={VARIANT_INFO}
      selectedOption={selectedVariant}
      onOptionChange={onVariantChange}
      className={className}
    />
  );
} 