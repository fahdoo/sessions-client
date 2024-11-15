import { useState } from 'react';

export interface MediaDeviceState {
  hasAudioPermission: boolean;
  hasMicrophoneDevices: boolean;
  error?: string;
  isChecking: boolean;
  hasAttemptedCheck: boolean;
  isBlocked: boolean;
}

export function useMediaDevices() {
  const [deviceState, setDeviceState] = useState<MediaDeviceState>({
    hasAudioPermission: false,
    hasMicrophoneDevices: false,
    isChecking: false,
    hasAttemptedCheck: false,
    isBlocked: false,
  });

  async function checkDevices() {
    setDeviceState(prev => ({ ...prev, isChecking: true, isBlocked: false }));
    
    try {
      // First quick check if we can even access mediaDevices
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BLOCKED');
      }

      // Add timeout for permanently blocked cases
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 500); // Reduced timeout
      });

      try {
        await Promise.race([
          navigator.mediaDevices.getUserMedia({ audio: true }),
          timeoutPromise
        ]);

        // If we get here, permission was granted
        setDeviceState({
          hasAudioPermission: true,
          hasMicrophoneDevices: true,
          isChecking: false,
          hasAttemptedCheck: true,
          isBlocked: false,
        });
        return true;

      } catch (error) {
        if (error instanceof Error && error.message === 'TIMEOUT') {
          setDeviceState({
            hasAudioPermission: false,
            hasMicrophoneDevices: false,
            error: 'Microphone access is blocked in browser settings',
            isChecking: false,
            hasAttemptedCheck: true,
            isBlocked: true,
          });
          return false;
        }
        throw error; // Re-throw for other errors
      }

    } catch (error) {
      let errorMessage = 'Unknown error accessing microphone';
      let isBlocked = false;
      
      if (error instanceof Error) {
        if (error.message === 'BLOCKED') {
          errorMessage = 'Mic permission blocked in settings';
          isBlocked = true;
        } else {
          switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
              errorMessage = 'Mic permission needed';
              isBlocked = true;
              break;
            case 'NotFoundError':
              errorMessage = 'No microphone found';
              isBlocked = true;
              break;
            case 'NotReadableError':
            case 'TrackStartError':
              errorMessage = 'Microphone is in use';
              break;
            case 'OverconstrainedError':
              errorMessage = 'Microphone not compatible';
              break;
          }
        }
      }

      setDeviceState({
        hasAudioPermission: false,
        hasMicrophoneDevices: false,
        error: errorMessage,
        isChecking: false,
        hasAttemptedCheck: true,
        isBlocked,
      });
      return false;
    }
  }

  return {
    ...deviceState,
    checkDevices,
  };
} 