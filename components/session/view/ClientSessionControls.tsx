'use client';

import { Edit2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { BackButton } from '@/components/ui/back-button';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/useToast';
import { Session } from '@/lib/types';

interface ClientSessionControlsProps {
  session: Session;
  isOwner: boolean;
  currentTitle: string;
  transcriptStatus: string | null;
  transcriptUrl: string | null;
  onTitleGenerated?: (newTitle: string) => void;
}

export function ClientSessionControls({ 
  session, 
  isOwner,
}: ClientSessionControlsProps) {
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleConvertAudio = async () => {
    if (!session.id || isConverting) return;
    
    setIsConverting(true);
    try {
      const response = await fetch(`/api/sessions/${session.id}/convert-audio`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to convert audio');
      }
      
      // Refresh the page to show the new audio
      window.location.reload();
    } catch (error) {
      console.error('Error converting audio:', error);
      toast({
        title: 'Error',
        description: 'Failed to convert audio file',
        variant: 'destructive',
      });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <BackButton />
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link href={`/sessions/${session.id}/edit`}>
              <ActionButton Icon={Edit2} />
            </Link>
          )}
        </div>
      </div>
      
      {session.audioUrl && session.audioStatus !== 'processed' && (
        <Button
          onClick={handleConvertAudio}
          disabled={isConverting}
          variant="secondary"
        >
          {isConverting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting Audio...
            </>
          ) : (
            'Convert & Clean Audio'
          )}
        </Button>
      )}
    </div>
  );
}
