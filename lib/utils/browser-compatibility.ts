// Centralize browser capability checks
export const browserCapabilities = {
  // Check if Permissions API is fully supported
  hasPermissionsAPI: () => !!(
    navigator?.permissions?.query
  ),

  // Check if MediaDevices API is supported
  hasMediaDevices: () => !!(
    navigator?.mediaDevices?.getUserMedia
  ),

  // Check if MediaSession API is supported
  hasMediaSession: () => 'mediaSession' in navigator,

  // Check if audio features are supported
  hasAudioSupport: () => {
    if (typeof window === 'undefined') return false;
    const audio = document.createElement('audio');
    return audio.canPlayType('audio/webm; codecs="opus"') !== "";
  }
}; 