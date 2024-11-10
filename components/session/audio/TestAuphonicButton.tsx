'use client';

import { useState } from 'react';
import { Beaker } from 'lucide-react';
import { ActionButton } from '@/components/ui/action-button';
import { fetchAudioUrl } from '@/lib/utils/audio';
import { Session } from '@/lib/types';
import { useToast } from '@/lib/hooks/useToast';

interface TestAuphonicButtonProps {
  session: Session;
  onProcessingStarted?: () => void;
}

export function TestAuphonicButton({ session, onProcessingStarted }: TestAuphonicButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleClick = async () => {
    try {
      setIsProcessing(true);
      
      // Check current status
      if (session.audioStatus === 'processing') {
        toast({
          description: 'This session is already being processed',
          variant: 'default'
        });
        return;
      }
      
      toast({
        description: 'Fetching audio URL...',
      });
      
      // Get the signed URL for processing
      const audioUrl = await fetchAudioUrl(session.id, true);
      
      toast({
        description: 'Starting Auphonic processing...',
      });
      
      // Start Auphonic processing
      const response = await fetch('/api/sessions/process-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sessionId: session.id,
          audioUrl
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start processing');
      }

      const data = await response.json();

      toast({
        description: `Audio processing started. UUID: ${data.auphonicUuid}`,
        duration: 5000,
      });

      onProcessingStarted?.();
    } catch (error) {
      console.error('Error starting audio processing:', error);
      toast({
        description: error instanceof Error ? error.message : 'Failed to start processing',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ActionButton
      Icon={Beaker}
      onClick={handleClick}
      disabled={isProcessing}
      loading={isProcessing}
      title="Test Auphonic Processing"
    />
  );
} 