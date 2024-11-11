'use client';

import { Button } from '@/components/ui/button';
import { LucideIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonProps {
  Icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
  variant?: 'default' | 'dark';
  loading?: boolean;
  title?: string;
}

export function ActionButton({ 
  Icon, 
  onClick, 
  className = '', 
  disabled = false,
  'aria-label': ariaLabel,
  variant = 'default',
  loading = false,
  title
}: ActionButtonProps) {
  const baseStyles = "rounded-full h-8 w-8";
  const variantStyles = {
    default: "bg-slate-900/20 backdrop-blur-sm hover:bg-slate-900/30 text-white",
    dark: "bg-slate-200 hover:bg-slate-300 text-slate-900"
  };

  const button = (
    <Button 
      variant="secondary" 
      size="icon" 
      className={cn(
        baseStyles,
        variantStyles[variant],
        loading && "animate-pulse",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
    </Button>
  );

  if (title) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent>
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
