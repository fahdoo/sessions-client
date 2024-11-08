import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from "@clerk/nextjs";

interface InitialControlBarProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function InitialControlBar({ onConnect, isConnecting }: InitialControlBarProps) {
  const { isSignedIn } = useAuth();

  return (
    <Button
      onClick={onConnect}
      disabled={isConnecting}
      className={`font-medium px-8 py-6 text-lg ${
        isSignedIn 
          ? "bg-green-500 hover:bg-green-600 text-white" 
          : "bg-blue-500 hover:bg-blue-600 text-white"
      }`}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Starting...
        </>
      ) : isSignedIn ? (
        "Start your Session"
      ) : (
        "Sign in to talk"
      )}
    </Button>
  );
} 