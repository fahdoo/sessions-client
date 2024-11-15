'use client';

import { SelectorGroup, type OptionInfo } from "@/components/ui/selector-group";
import { Globe, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

export type VisibilityOption = 'public' | 'private';

interface SessionVisibilitySelectorProps {
  selectedVisibility: VisibilityOption;
  onVisibilityChange: (visibility: VisibilityOption) => void;
}

const visibilityOptions: Record<VisibilityOption, OptionInfo> = {
  public: {
    id: 'public',
    icon: Globe,
    label: 'Public',
    description: 'Anyone can view this session'
  },
  private: {
    id: 'private',
    icon: Lock,
    label: 'Private',
    description: 'Only you can view this session'
  }
};

export function SessionVisibilitySelector({ 
  selectedVisibility, 
  onVisibilityChange 
}: SessionVisibilitySelectorProps) {
  return (
    <SelectorGroup
      options={visibilityOptions}
      selectedOption={selectedVisibility}
      onOptionChange={onVisibilityChange}
    />
  );
} 