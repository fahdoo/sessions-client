import { Globe, Lock } from 'lucide-react';
import { SelectorGroup, type OptionInfo } from '@/components/ui/selector-group';

export type VisibilityOption = 'public' | 'private';

interface SessionVisibilitySelectorProps {
  selectedVisibility: VisibilityOption;
  onVisibilityChange: (visibility: VisibilityOption) => void;
}

const VISIBILITY_INFO: Record<VisibilityOption, OptionInfo> = {
  public: {
    id: 'public',
    icon: Globe,
    label: 'Public',
    description: 'Share your session with the community'
  },
  private: {
    id: 'private',
    icon: Lock,
    label: 'Private',
    description: 'Keep your session just for you'
  }
};

export function SessionVisibilitySelector({ selectedVisibility, onVisibilityChange }: SessionVisibilitySelectorProps) {
  return (
    <SelectorGroup
      options={VISIBILITY_INFO}
      selectedOption={selectedVisibility}
      onOptionChange={onVisibilityChange}
    />
  );
} 