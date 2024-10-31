import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface InitialControlBarProps {
  onConnect: () => void;
  isConnecting: boolean;
}

export function InitialControlBar({ onConnect, isConnecting }: InitialControlBarProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <Button 
        onClick={onConnect}
        disabled={isConnecting}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          'Start your Session'
        )}
      </Button>
    </div>
  );
} 