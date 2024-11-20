import { useState, useEffect } from 'react';

export interface MediaDeviceState {
  hasAudioPermission: boolean;
  hasMicrophoneDevices: boolean;
  error?: string;
  isChecking: boolean;
  hasAttemptedCheck: boolean;
  isBlocked: boolean;
}

// Add helper function to safely check permissions API support
const hasPermissionsSupport = () => {
  return !!(
    navigator &&
    navigator.permissions &&
    typeof navigator.permissions.query === 'function'
  );
};

export function useMediaDevices() {
  const [deviceState, setDeviceState] = useState<MediaDeviceState>({
    hasAudioPermission: false,
    hasMicrophoneDevices: false,
    isChecking: false,
    hasAttemptedCheck: false,
    isBlocked: false,
  });

  // Set up permission change listener once
  useEffect(() => {
    // Skip if Permissions API is not supported
    if (!hasPermissionsSupport()) {
      console.log('Permissions API not supported');
      return;
    }

    let permissionStatus: PermissionStatus | null = null;
    
    // Wrap in try-catch for additional safety
    try {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(status => {
          permissionStatus = status;
          const handlePermissionChange = () => {
            if (status.state === 'granted') {
              setDeviceState({
                hasAudioPermission: true,
                hasMicrophoneDevices: true,
                isChecking: false,
                hasAttemptedCheck: true,
                isBlocked: false,
              });
            }
          };
          status.addEventListener('change', handlePermissionChange);
          return () => {
            status.removeEventListener('change', handlePermissionChange);
          };
        })
        .catch(error => {
          console.warn('Permission query failed:', error);
          // Fall back to checking getUserMedia directly
          checkDevices();
        });
    } catch (error) {
      console.warn('Error setting up permissions listener:', error);
      // Fall back to checking getUserMedia directly
      checkDevices();
    }
  }, []);

  async function checkDevices() {
    setDeviceState(prev => ({ ...prev, isChecking: true, isBlocked: false }));
    
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('BLOCKED');
      }

      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });

        setDeviceState({
          hasAudioPermission: true,
          hasMicrophoneDevices: true,
          isChecking: false,
          hasAttemptedCheck: true,
          isBlocked: false,
        });
        return true;

      } catch (error) {
        if (error instanceof Error) {
          switch (error.name) {
            case 'NotAllowedError':
            case 'PermissionDeniedError':
              setDeviceState({
                hasAudioPermission: false,
                hasMicrophoneDevices: true,
                error: 'Mic permission needed',
                isChecking: false,
                hasAttemptedCheck: true,
                isBlocked: true,
              });
              return false;
            default:
              throw error;
          }
        }
        throw error;
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