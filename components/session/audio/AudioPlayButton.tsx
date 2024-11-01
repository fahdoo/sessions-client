'use client';

import { Play, Pause } from 'lucide-react';
import LoadingIndicator from '@/components/LoadingIndicator';

interface AudioPlayButtonProps {
  isPlaying: boolean;
  loading?: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AudioPlayButton({ 
  isPlaying, 
  loading = false, 
  onClick,
  size = 'md',
  disabled = false
}: AudioPlayButtonProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  const loadingSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <button 
      onClick={onClick} 
      className={`
        ${sizeClasses[size]} 
        flex items-center justify-center 
        rounded-full 
        ${isPlaying 
          ? 'bg-sky-600 hover:bg-sky-700 animate-pulse-light' 
          : 'bg-blue-500/20 hover:bg-blue-500/40'
        } 
        text-white 
        transition-colors
        disabled:opacity-50
        disabled:cursor-not-allowed
      `}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingIndicator size={loadingSizes[size]} />
        </div>
      ) : isPlaying ? (
        <Pause size={iconSizes[size]} />
      ) : (
        <Play size={iconSizes[size]} />
      )}
    </button>
  );
} 