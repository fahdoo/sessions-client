import { AgentVariantSelector, type AgentVariant } from './AgentVariantSelector';
import { SessionVisibilitySelector, type VisibilityOption } from './SessionVisibilitySelector';
import { AgentVoiceSelector, type AgentVoice } from './AgentVoiceSelector';
import { PersonalizationDialog } from './PersonalizationDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface SessionOptionsBarProps {
  visibility: VisibilityOption;
  onVisibilityChange: (visibility: VisibilityOption) => void;
  agentVariant: AgentVariant;
  onVariantChange: (variant: AgentVariant) => void;
  agentVoice: AgentVoice;
  onVoiceChange: (voice: AgentVoice) => void;
  show: boolean | undefined;
}

export function SessionOptionsBar({
  visibility,
  onVisibilityChange,
  agentVariant,
  onVariantChange,
  agentVoice,
  onVoiceChange,
  show
}: SessionOptionsBarProps) {
  return (
    <AnimatePresence>
      {!!show && (
        <motion.div 
          className="flex gap-2 md:gap-4 mt-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <SessionVisibilitySelector
            selectedVisibility={visibility}
            onVisibilityChange={onVisibilityChange}
          />
          <AgentVariantSelector
            selectedVariant={agentVariant}
            onVariantChange={onVariantChange}
          />
          <AgentVoiceSelector
            selectedVoice={agentVoice}
            onVoiceChange={onVoiceChange}
          />
          <PersonalizationDialog />
        </motion.div>
      )}
    </AnimatePresence>
  );
} 