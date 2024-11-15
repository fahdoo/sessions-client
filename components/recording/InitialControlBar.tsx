import { Button } from '@/components/ui/button';
import { Loader2, Speech } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { PreRoomDeviceStatus } from './PreRoomDeviceStatus';
import { useState, useEffect } from 'react';

interface InitialControlBarProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function InitialControlBar({ onConnect, isConnecting }: InitialControlBarProps) {
  const { isSignedIn } = useAuth();
  const { 
    hasAudioPermission, 
    isChecking, 
    checkDevices, 
    hasAttemptedCheck,
    isBlocked 
  } = useMediaDevices();

  const [isFirstError, setIsFirstError] = useState(true);

  useEffect(() => {
    if (hasAttemptedCheck && !hasAudioPermission) {
      setIsFirstError(false);
    }
  }, [hasAttemptedCheck, hasAudioPermission]);

  const handleClick = async () => {
    if (!isSignedIn) {
      onConnect();
      return;
    }

    if (!hasAudioPermission && !isChecking) {
      const hasPermission = await checkDevices();
      if (hasPermission) {
        onConnect();
      }
      return;
    }
    onConnect();
  };

  const handleRetry = async () => {
    await checkDevices();
  };

  const isDisabled = isConnecting || (isSignedIn && isBlocked);

  return (
    <div className="flex flex-col items-center">      
      <Button
        onClick={handleClick}
        disabled={isDisabled || (isSignedIn && isChecking)}
        className={`font-medium px-8 py-6 text-xl transition-all duration-200 ${
          isDisabled || (isSignedIn && isChecking)
            ? "bg-slate-800 text-slate-400 hover:bg-slate-800 cursor-not-allowed opacity-50"
            : isSignedIn 
              ? "bg-stone-500 hover:bg-stone-600 text-white" 
              : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Speech className="mr-2 h-5 w-5" />
            {isSignedIn ? 'Start your Session' : 'Sign in to talk'}
          </>
        )}
      </Button>
      
      {isSignedIn && (
        <div className={`mt-4 ${!isFirstError ? 'h-8' : ''}`}>
          {hasAttemptedCheck && !hasAudioPermission && !isChecking && (
            <PreRoomDeviceStatus 
              onRetry={handleRetry}
              animate={isFirstError}
            />
          )}
        </div>
      )}
    </div>
  );
} 