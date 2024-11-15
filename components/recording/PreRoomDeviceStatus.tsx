import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { Mic, MicOff, HelpCircle, Loader2 } from 'lucide-react';
import { TroubleshootingDialog } from './TroubleshootingDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface PreRoomDeviceStatusProps {
  className?: string;
  onRetry?: () => void;
  animate?: boolean;
  error?: string;
}

export function PreRoomDeviceStatus({ className = '', onRetry, animate = true, error: customError }: PreRoomDeviceStatusProps) {
  const { hasAudioPermission, hasMicrophoneDevices, error, isChecking } = useMediaDevices();
  const [hasShown, setHasShown] = useState(false);

  const handleRetry = () => {
    onRetry?.();
  };

  const shouldShowHelp = !hasMicrophoneDevices || !hasAudioPermission;

  return (
    <div className={`h-8 ${className}`}>
      <AnimatePresence mode="wait">
        {(shouldShowHelp || customError) && (
          <div className="flex items-center justify-center">
            <TroubleshootingDialog>
              <motion.div 
                className="group relative flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 hover:bg-red-500/20 transition-colors cursor-pointer"
                initial={!hasShown ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                onAnimationComplete={() => setHasShown(true)}
              >
                {isChecking ? (
                  <Loader2 className="h-4 w-4 text-red-500 animate-spin" />
                ) : (
                  <MicOff className="h-4 w-4 text-red-500" />
                )}
                <span className="text-xs text-red-200">
                  {customError || (!hasMicrophoneDevices 
                    ? 'No microphone found'
                    : hasAudioPermission 
                      ? 'Microphone ready'
                      : 'Mic permission needed')}
                </span>
                {onRetry && !isChecking && (
                  <span 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry();
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors leading-none cursor-pointer"
                  >
                    Retry
                  </span>
                )}
                <HelpCircle className="h-4 w-4 text-red-200" />
              </motion.div>
            </TroubleshootingDialog>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
} 