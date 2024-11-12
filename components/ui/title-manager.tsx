'use client';

import { useEffect } from 'react';

interface TitleManagerProps {
  title?: string;
}

export function TitleManager({ title }: TitleManagerProps) {
  useEffect(() => {
    if (title) {
      document.title = `${title} - Sessional AI`;
    }
    
    // Restore the default title when component unmounts
    return () => {
      document.title = 'Sessional AI';
    };
  }, [title]);

  return null;
} 