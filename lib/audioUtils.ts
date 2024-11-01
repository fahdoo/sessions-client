import { isSafari } from '@/lib/browser-utils';

// Add interface for audio format support
interface AudioFormatSupport {
  ogg: {
    basic: string;
    vorbis: string;
    opus: string;
  };
  aac: {
    basic: string;
    lc: string;
    he: string;
  };
  mp3: string;
}

// Update the audio format check
export function checkAudioSupport(): AudioFormatSupport {
  if (typeof window === 'undefined') {
    return {
      ogg: { basic: '', vorbis: '', opus: '' },
      aac: { basic: '', lc: '', he: '' },
      mp3: ''
    };
  }

  const audio = new Audio();
  return {
    ogg: {
      basic: audio.canPlayType('audio/ogg'),
      vorbis: audio.canPlayType('audio/ogg; codecs="vorbis"'),
      opus: audio.canPlayType('audio/ogg; codecs="opus"')
    },
    aac: {
      basic: audio.canPlayType('audio/aac'),
      lc: audio.canPlayType('audio/mp4; codecs="mp4a.40.2"'),
      he: audio.canPlayType('audio/mp4; codecs="mp4a.40.5"')
    },
    mp3: audio.canPlayType('audio/mpeg')
  };
}

export const fetchAudioUrl = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is missing");
  }

  try {
    // Simplified Accept header
    const headers: HeadersInit = {
      'Accept': isSafari() ? 
        'audio/x-m4a,audio/aac,audio/mp4,audio/*;q=0.8' : 
        'audio/ogg,audio/aac,audio/mp4,audio/*;q=0.8'
    };

    const response = await fetch(`/api/sessions/${sessionId}/audio-url`, {
      credentials: 'include',
      headers
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch audio (${response.status})`);
    }

    if (!data.url) {
      throw new Error("No audio URL returned from server");
    }

    // Don't modify the URL - use it as is from the server
    const url = new URL(data.url);
    const fileExtension = url.pathname.split('.').pop()?.toLowerCase();
    
    // Log the final URL for debugging (without sensitive parts)
    const debugUrl = new URL(url.toString());
    debugUrl.search = ''; // Remove query params for logging
    console.log('Audio URL format:', {
      extension: fileExtension,
      isSafari: isSafari(),
      path: debugUrl.pathname
    });

    return data.url;
  } catch (error) {
    console.error('Audio fetch error:', error);
    throw error;
  }
};

// Update setupAudioEventListeners to include format support logging
export function setupAudioEventListeners(
  audio: HTMLAudioElement,
  callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
  }
) {
  if (!audio.src) {
    console.warn('Attempted to setup audio listeners before src was set');
    return () => {};
  }

  const handleError = (e: Event) => {
    const error = (e.target as HTMLAudioElement).error;
    const support = checkAudioSupport();
    
    if (audio.src) {
      console.error('Audio error details:', {
        code: error?.code,
        message: error?.message,
        formatSupport: support,
        event: {
          type: e.type,
          target: e.target,
          timeStamp: e.timeStamp,
        },
        audioState: {
          src: audio.src,
          readyState: audio.readyState,
          networkState: audio.networkState,
          paused: audio.paused,
          currentTime: audio.currentTime,
          crossOrigin: audio.crossOrigin,
        }
      });
    }

    callbacks.onPause?.();
  };

  const handleLoaded = () => {
    audio.removeEventListener('loadeddata', handleLoaded);
    // Only attempt to play if explicitly requested (don't auto-play)
    if (!audio.paused) {
      audio.play().catch(error => {
        console.error('Play failed after load:', error);
        callbacks.onPause?.();
      });
    }
  };

  // Add error event listener for the audio source element
  const sourceElement = document.createElement('source');
  sourceElement.addEventListener('error', (e) => {
    console.error('Source element error:', {
      event: e,
      src: sourceElement.src,
      type: sourceElement.type
    });
  });

  audio.addEventListener('error', handleError);
  audio.addEventListener('loadeddata', handleLoaded);
  audio.addEventListener('play', callbacks.onPlay || (() => {}));
  audio.addEventListener('pause', callbacks.onPause || (() => {}));
  audio.addEventListener('ended', callbacks.onEnded || (() => {}));

  return () => {
    audio.removeEventListener('error', handleError);
    audio.removeEventListener('loadeddata', handleLoaded);
    audio.removeEventListener('play', callbacks.onPlay || (() => {}));
    audio.removeEventListener('pause', callbacks.onPause || (() => {}));
    audio.removeEventListener('ended', callbacks.onEnded || (() => {}));
  };
}

// Only run test in development
export const testAudioUrl = async (url: string) => {
  console.log('testAudioUrl called with:', url);
  if (process.env.NODE_ENV === 'development') {
    console.log('Running in development mode');
    try {
      // Instead of direct HEAD request to S3, check through our API
      const sessionId = extractSessionIdFromUrl(url);
      if (!sessionId) {
        console.warn('Could not extract session ID from URL:', url);
        return true; // Continue anyway
      }

      const response = await fetch(`/api/sessions/${sessionId}/audio-url/test`, {
        method: 'HEAD',
        credentials: 'include'
      });

      const headers = {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        url: url
      };
      console.log('Audio file headers:', headers);
      return response.ok;
    } catch (error) {
      console.error('Audio file test failed:', error);
      return false;
    }
  }
  console.log('Skipping test (not in development)');
  return true;
};

// Helper function to extract session ID from S3 URL
function extractSessionIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/room_([0-9a-f-]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting session ID from URL:', error);
    return null;
  }
}

interface MediaMetadata {
  title: string;
  artist: string;
  artwork?: MediaImage[];
}

interface MediaImage {
  src: string;
  sizes: string;
  type: string;
}

export function setupMediaSession(
  mediaElement: HTMLMediaElement, 
  metadata: MediaMetadata
) {
  if ('mediaSession' in navigator) {
    // Create metadata object, only including artwork if it's provided
    const mediaMetadata: MediaMetadataInit = {
      title: metadata.title,
      artist: metadata.artist,
    };
    
    // Only add artwork if it exists and is a valid array
    if (metadata.artwork && Array.isArray(metadata.artwork)) {
      mediaMetadata.artwork = metadata.artwork;
    }

    navigator.mediaSession.metadata = new window.MediaMetadata(mediaMetadata);
  }
}

// Add this check to ensure we only run in browser environment
const isBrowser = typeof window !== 'undefined';

