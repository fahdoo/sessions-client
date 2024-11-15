import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { Mic, MicOff, HelpCircle } from 'lucide-react';
import { TroubleshootingDialog } from './TroubleshootingDialog';
import { motion, AnimatePresence } from 'framer-motion';

interface PreRoomDeviceStatusProps {
  className?: string;
}

export function PreRoomDeviceStatus({ className = '' }: PreRoomDeviceStatusProps) {
  const { hasAudioPermission, hasMicrophoneDevices, error } = useMediaDevices();

  const shouldShowHelp = !hasMicrophoneDevices || !hasAudioPermission;

  return (
    <AnimatePresence>
      {shouldShowHelp && (
        <motion.div 
          className={`flex items-center justify-center ${className}`}
          initial={{ opacity: 1, y: 0 }}
          exit={{ 
            opacity: 0, 
            y: 20,
            transition: { 
              duration: 0.2,
              ease: 'easeOut'
            }
          }}
        >
          <TroubleshootingDialog>
            <button 
              className={`flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1.5 ${
                shouldShowHelp ? 'hover:bg-slate-950/50 transition-colors' : ''
              }`}
              disabled={!shouldShowHelp}
            >
              {!hasMicrophoneDevices ? (
                <MicOff className="h-4 w-4 text-red-500" />
              ) : hasAudioPermission ? (
                <Mic className="h-4 w-4 text-green-500" />
              ) : (
                <MicOff className="h-4 w-4 text-yellow-500" />
              )}
              <span className="text-xs text-slate-400">
                {!hasMicrophoneDevices 
                  ? 'Detecting microphone...'
                  : hasAudioPermission 
                    ? 'Microphone ready'
                    : 'Permission needed'}
              </span>
              {shouldShowHelp && (
                <HelpCircle className="h-4 w-4 text-slate-400" />
              )}
            </button>
          </TroubleshootingDialog>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 