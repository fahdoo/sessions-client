'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <Button 
      variant="secondary" 
      size="icon" 
      className="rounded-full bg-slate-900/20 backdrop-blur-sm hover:bg-slate-900/30 z-20 h-8 w-8"
      onClick={() => router.back()}
    >
      <ChevronLeft className="h-4 w-4 text-white" />
    </Button>
  );
}
