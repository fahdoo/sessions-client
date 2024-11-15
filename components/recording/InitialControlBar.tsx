import { Button } from '@/components/ui/button';
import { Loader2, Speech } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";
import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { PreRoomDeviceStatus } from './PreRoomDeviceStatus';

interface InitialControlBarProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function InitialControlBar({ onConnect, isConnecting }: InitialControlBarProps) {
  const { isSignedIn } = useAuth();
  const { hasAudioPermission } = useMediaDevices();

  return (
    <div>      
      <Button
        onClick={onConnect}
        disabled={isConnecting || !hasAudioPermission}
        className={`font-medium px-8 py-6 text-xl transition-all duration-200 ${
          isConnecting || !hasAudioPermission
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
        ) : isSignedIn ? (
          <>
            <Speech className="mr-2 h-5 w-5" />
            Start your Session
          </>
        ) : (
          <>
            <Speech className="mr-2 h-5 w-5" />
            Sign in to talk
          </>
        )}
      </Button>
      <PreRoomDeviceStatus className="mt-4" />
    </div>
  );
} 