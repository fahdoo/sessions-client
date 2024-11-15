import { useState, useEffect } from 'react';

export interface MediaDeviceState {
  hasAudioPermission: boolean;
  hasMicrophoneDevices: boolean;
  error?: string;
}

export function useMediaDevices() {
  const [deviceState, setDeviceState] = useState<MediaDeviceState>({
    hasAudioPermission: false,
    hasMicrophoneDevices: false,
  });

  async function checkDevices() {
    try {
      // First check if we have any audio input devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophones = devices.some(device => device.kind === 'audioinput');

      if (!hasMicrophones) {
        setDeviceState({
          hasAudioPermission: false,
          hasMicrophoneDevices: false,
          error: 'No microphone found'
        });
        return;
      }

      // If we have microphones, then check permissions
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // Clean up

        setDeviceState({
          hasAudioPermission: true,
          hasMicrophoneDevices: true
        });
      } catch (permissionError) {
        // We have microphones but permission was denied
        setDeviceState({
          hasAudioPermission: false,
          hasMicrophoneDevices: true,
          error: 'Microphone permission denied'
        });
      }

    } catch (error) {
      let errorMessage = 'Unknown error accessing microphone';
      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            errorMessage = 'Microphone permission denied';
            break;
          case 'NotFoundError':
            errorMessage = 'No microphone found';
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            errorMessage = 'Microphone is in use by another application';
            break;
          case 'OverconstrainedError':
            errorMessage = 'Microphone constraints not satisfied';
            break;
        }
      }
      setDeviceState({
        hasAudioPermission: false,
        hasMicrophoneDevices: false,
        error: errorMessage
      });
    }
  }

  useEffect(() => {
    checkDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      checkDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  return deviceState;
} 