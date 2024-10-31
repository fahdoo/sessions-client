'use client';

import { Shield, Loader2, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StatusBarProps {
  status: 'listening' | 'speaking' | 'thinking';
  transcriptComponent?: React.ReactNode;
}

export function StatusBar({ status, transcriptComponent }: StatusBarProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'listening':
        return <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'speaking':
        return <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'thinking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
    }
  };

  return (
    <div className="fixed top-16 right-0 left-0 px-4 z-40">
      <div className="max-w-fit mx-auto bg-slate-900/50 backdrop-blur-sm rounded-full px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <Badge variant="secondary" className="flex items-center space-x-1 bg-slate-800/50">
            <Shield className="w-4 h-4" />
            <span>Private</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1 bg-slate-800/50">
            {getStatusIcon()}
            <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
          </Badge>
          {transcriptComponent}
        </div>
      </div>
    </div>
  );
} 