'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { createPoller } from '@/lib/utils/polling';

interface ProcessingStatusProps {
  sessionId: string;
}

export function ProcessingStatus({ sessionId }: ProcessingStatusProps) {
  const [isProcessing, setIsProcessing] = useState(true);
  const [progress, setProgress] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      const data = await response.json();
      return data.transcriptStatus !== 'processing';
    } catch (error) {
      console.error('Error polling session status:', error);
      return false;
    }
  }, [sessionId]);

  useEffect(() => {
    const cleanup = createPoller(checkStatus, {
      interval: 5000, // 5 seconds
      maxAttempts: 60, // 5 minutes max
      onSuccess: () => {
        setIsProcessing(false);
        window.location.reload();
      },
      onError: (error) => {
        console.error('Polling error:', error);
        setIsProcessing(false);
      },
      onMaxAttemptsReached: () => {
        console.warn('Max poll attempts reached');
        setIsProcessing(false);
      }
    });

    cleanupRef.current = cleanup;

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [checkStatus]);

  if (!isProcessing) return null;

  return (
    <div className="max-w-2xl mx-auto mt-4 px-4">
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex items-center gap-2 text-blue-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          <p>Processing session content... {progress}%</p>
        </div>
      </Card>
    </div>
  );
} 