'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  Icon: LucideIcon;
  onClick?: () => void;
  className?: string;
}

export function ActionButton({ Icon, onClick, className = '' }: ActionButtonProps) {
  return (
    <Button 
      variant="secondary" 
      size="icon" 
      className={`rounded-full bg-slate-900/20 backdrop-blur-sm hover:bg-slate-900/30 h-8 w-8 ${className}`}
      onClick={onClick}
    >
      <Icon className="h-4 w-4 text-white" />
    </Button>
  );
}
