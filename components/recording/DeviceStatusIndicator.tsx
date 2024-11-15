import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { Mic, MicOff, WifiOff } from 'lucide-react';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

export function DeviceStatusIndicator() {
  const { hasAudioPermission, hasMicrophoneDevices, error } = useMediaDevices();
  const connectionState = useConnectionState();

  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Microphone Status */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
        {!hasMicrophoneDevices ? (
          <MicOff className="h-4 w-4 text-red-500" />
        ) : hasAudioPermission ? (
          <Mic className="h-4 w-4 text-green-500" />
        ) : (
          <MicOff className="h-4 w-4 text-yellow-500" />
        )}
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {!hasMicrophoneDevices 
            ? 'No microphone found'
            : hasAudioPermission 
              ? 'Microphone ready'
              : 'Permission needed'}
        </span>
      </div>

      {/* Connection Status */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
        {connectionState === ConnectionState.Connected ? (
          <div className="h-2 w-2 rounded-full bg-green-500" />
        ) : connectionState === ConnectionState.Connecting ? (
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {connectionState}
        </span>
      </div>
    </div>
  );
} 