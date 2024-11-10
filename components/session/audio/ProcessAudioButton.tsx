'use client';

import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/lib/hooks/useToast';
import { Session } from '@/lib/types';
import { processAudio } from '@/lib/utils/audio-conversion';
import { useRouter } from 'next/navigation';

interface ProcessAudioButtonProps {
  session: Session;
  signedUrl?: string;
  onProcessingComplete?: (updatedSession: Session) => void;
}

type ProcessingStep = 
  | 'converting'    // FFmpeg conversion
  | 'uploading'     // S3 upload
  | 'updating'      // Database update
  | 'idle';         // Not processing

const MINIMUM_STEP_DURATION = 1000; // 1 second minimum for each step

export function ProcessAudioButton({ session, signedUrl, onProcessingComplete }: ProcessAudioButtonProps) {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>('idle');
  const { toast } = useToast();
  const router = useRouter();

  const getProcessingMessage = (step: ProcessingStep) => {
    switch (step) {
      case 'converting':
        return '1/3 Enhancing...';
      case 'uploading':
        return '2/3 Uploading...';
      case 'updating':
        return '3/3 Saving...';
      default:
        return session.originalAudioUrl ? 'Re-enhance Audio' : 'Enhance Audio';
    }
  };

  const setProcessingStepWithMinDuration = async (step: ProcessingStep) => {
    const startTime = Date.now();
    setProcessingStep(step);
    
    // Return a promise that resolves after the minimum duration
    return new Promise<void>(resolve => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, MINIMUM_STEP_DURATION - elapsed);
      setTimeout(resolve, remaining);
    });
  };

  const handleProcessAudio = async () => {
    // Always use original audio URL if available
    const sourceAudioUrl = session.originalAudioUrl;
    
    if (!session.id || !sourceAudioUrl || processingStep !== 'idle') {
      console.log('ProcessAudioButton: Missing required data:', { 
        sessionId: session.id, 
        hasOriginalUrl: !!sourceAudioUrl,
        processingStep 
      });
      toast({
        title: 'Error',
        description: 'Original audio not available for processing',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get signed URL for the original audio
      const urlResponse = await fetch(`/api/sessions/${session.id}/audio-url?forProcessing=true`);
      if (!urlResponse.ok) {
        throw new Error('Failed to get signed URL for original audio');
      }
      const { url: originalSignedUrl } = await urlResponse.json();
      
      if (!originalSignedUrl) {
        throw new Error('No signed URL returned for original audio');
      }

      // Log the URLs being used
      console.log('ProcessAudioButton: Starting audio conversion:', {
        sourceUrl: sourceAudioUrl,
        signedUrl: originalSignedUrl
      });

      // Step 1: Convert audio using original signed URL
      console.log('ProcessAudioButton: Starting audio conversion from source:', sourceAudioUrl);
      await setProcessingStepWithMinDuration('converting');
      const { audioBlob, durationInSeconds } = await processAudio(session.id, sourceAudioUrl, originalSignedUrl);
      console.log('ProcessAudioButton: Audio conversion complete:', {
        blobSize: audioBlob.size,
        duration: durationInSeconds
      });
      
      // Step 2: Upload to S3
      console.log('ProcessAudioButton: Starting S3 upload...');
      await setProcessingStepWithMinDuration('uploading');
      const formData = new FormData();
      formData.append('audio', audioBlob, 'processed.m4a');
      formData.append('duration', String(durationInSeconds));
      
      const processResponse = await fetch(`/api/sessions/${session.id}/process-audio`, {
        method: 'POST',
        body: formData,
      });
      
      if (!processResponse.ok) {
        const errorData = await processResponse.json();
        throw new Error(errorData.error || 'Failed to process audio');
      }
      
      // Step 3: Update session data
      console.log('ProcessAudioButton: S3 upload complete, updating session...');
      await setProcessingStepWithMinDuration('updating');
      const data = await processResponse.json();
      
      const updatedSession = {
        ...session,
        audioUrl: data.audioUrl,
        originalAudioUrl: session.audioUrl,
        audioStatus: 'processed',
        duration: Math.round(data.duration)
      };

      console.log('ProcessAudioButton: Session update complete:', {
        newAudioUrl: data.audioUrl,
        duration: data.duration
      });

      // Update parent components
      if (onProcessingComplete) {
        onProcessingComplete(updatedSession);
      }

      toast({
        title: 'Success',
        description: 'Audio enhanced successfully',
      });

      // Force a router refresh to update server components
      router.refresh();
      
    } catch (error) {
      console.error('ProcessAudioButton: Error processing audio:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process audio file',
        variant: 'destructive',
      });
    } finally {
      setProcessingStep('idle');
    }
  };

  const isProcessing = processingStep !== 'idle';

  return (
    <Button
      onClick={handleProcessAudio}
      disabled={isProcessing || !session.audioUrl}
      variant="secondary"
    >
      {isProcessing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {getProcessingMessage(processingStep)}
        </>
      ) : (
        getProcessingMessage('idle')
      )}
    </Button>
  );
} 