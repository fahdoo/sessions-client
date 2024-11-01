'use client';

import { Button } from '@/components/ui/button';
import { Mic, MessageSquare } from 'lucide-react';

interface TestControlBarProps {
  onEnd?: () => void;
  transcriptComponent?: React.ReactNode;
}

export function TestControlBar({ onEnd, transcriptComponent }: TestControlBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
      <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-md p-2">
        <div className="flex items-center justify-center space-x-2">
          {transcriptComponent}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Mic className="h-5 w-5" />
          </Button>
          <Button variant="destructive" size="sm" onClick={onEnd}>
            End session
          </Button>
        </div>
      </div>
    </div>
  );
} 