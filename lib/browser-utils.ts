/**
 * Collection of browser-specific utility functions and constants
 */

/**
 * Detect if the current browser is Safari
 * Safari requires special handling for audio elements and CORS
 */
export const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('safari') && !ua.includes('chrome');
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