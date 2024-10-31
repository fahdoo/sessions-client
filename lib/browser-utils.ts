/**
 * Collection of browser-specific utility functions and constants
 */

/**
 * Check if the browser supports the audio formats we use
 * Returns true if the browser should work with our audio setup
 */
export const hasAudioSupport = () => {
  // Create a test audio element
  const audio = document.createElement('audio');
  
  // Test for opus in webm support (our primary format)
  const webmOpusSupport = audio.canPlayType('audio/webm; codecs="opus"');
  
  // canPlayType returns "", "maybe", or "probably"
  // Return true if there's any level of support
  return webmOpusSupport !== "";
};

/**
 * Detect if the current browser is Safari
 * Note: This is kept for Safari-specific audio configurations
 */
export const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  // Check for Safari but exclude Chrome and CriOS (Chrome on iOS)
  return ua.includes('safari') && !ua.includes('chrome') && !ua.includes('crios');
};

/**
 * Safari-specific audio initialization options
 * - preload='auto': Forces Safari to start loading the audio immediately
 * - crossOrigin='anonymous': Required for Safari when using MediaSession API
 */
export const getSafariAudioConfig = () => ({
  preload: 'auto' as const,
  crossOrigin: 'anonymous' as const,
});

/**
 * Get recommended timeout duration for audio operations based on browser
 * Safari often needs more time to handle audio operations
 */
export const getAudioOperationTimeout = () => {
  return isSafari() ? 100 : 50;
};

/**
 * Add cache-busting parameter to URL
 * Required for Safari to properly handle audio URLs and avoid caching issues
 * @param url The original URL
 * @returns URL with cache-busting parameter
 */
export const addCacheBuster = (url: string) => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};

/**
 * Check if the browser supports specific audio format
 * @param mimeType MIME type to check
 */
export const supportsAudioFormat = (mimeType: string): boolean => {
  const audio = document.createElement('audio');
  return audio.canPlayType(mimeType) !== "";
};

/**
 * Get appropriate audio URL based on browser support
 * Converts opus to MP3 if needed
 * @param originalUrl Original audio URL
 */
export async function getCompatibleAudioUrl(originalUrl: string): Promise<string> {
  // Check if browser supports opus
  if (supportsAudioFormat('audio/webm; codecs="opus"')) {
    return addCacheBuster(originalUrl);
  }
  
  // If opus isn't supported, convert to MP3
  try {
    const mp3Url = await convertOpusToMp3(originalUrl);
    return mp3Url;
  } catch (error) {
    console.error('Failed to convert audio format:', error);
    return originalUrl; // Fallback to original URL
  }
}