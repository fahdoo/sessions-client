'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps {
  Icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  variant?: 'default' | 'dark';
}

export function ActionButton({ 
  Icon, 
  onClick, 
  className = '', 
  disabled = false,
  'aria-label': ariaLabel,
  variant = 'default'
}: ActionButtonProps) {
  const baseStyles = "rounded-full h-8 w-8";
  const variantStyles = {
    default: "bg-slate-900/20 backdrop-blur-sm hover:bg-slate-900/30 text-white",
    dark: "bg-slate-200 hover:bg-slate-300 text-slate-900"
  };

  return (
    <Button 
      variant="secondary" 
      size="icon" 
      className={cn(
        baseStyles,
        variantStyles[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
