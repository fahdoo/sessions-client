import { isSafari } from '@/lib/browser-utils';

export const fetchAudioUrl = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is missing");
  }

  try {
    const response = await fetch(`/api/sessions/${sessionId}/audio-url`, {
      credentials: 'include',
      headers: {
        'Accept': isSafari() ? 
          'audio/ogg,audio/*;q=0.8,*/*;q=0.5' : 
          'audio/ogg,audio/*;q=0.8'
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch audio (${response.status})`);
    }

    if (!data.url) {
      throw new Error("No audio URL returned from server");
    }

    if (isSafari()) {
      const url = new URL(data.url);
      url.searchParams.set('response-content-type', 'audio/ogg');
      return url.toString();
    }

    return data.url;
  } catch (error) {
    console.error('Audio fetch error:', error);
    throw error;
  }
};

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

export function setupAudioEventListeners(
  audio: HTMLAudioElement,
  callbacks: {
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
  }
) {
  // Don't set up listeners until we have a src
  if (!audio.src) {
    console.warn('Attempted to setup audio listeners before src was set');
    return () => {};
  }

  const handleError = (e: Event) => {
    const error = (e.target as HTMLAudioElement).error;
    
    // Only log errors if we have a src
    if (audio.src) {
      console.error('Audio error details:', {
        code: error?.code,
        message: error?.message,
        formatSupport: {
          oggEmpty: audio.canPlayType('audio/ogg'),
          oggOpus: audio.canPlayType('audio/ogg; codecs="opus"'),
          oggVorbis: audio.canPlayType('audio/ogg; codecs="vorbis"'),
        },
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

// Add this check to ensure we only run in browser environment
const isBrowser = typeof window !== 'undefined';

export function checkAudioSupport() {
  if (!isBrowser) {
    return {
      ogg: {
        basic: '',
        vorbis: '',
        opus: ''
      },
      mp3: '',
      wav: ''
    };
  }

  const audio = new Audio();
  const support = {
    ogg: {
      basic: audio.canPlayType('audio/ogg'),
      vorbis: audio.canPlayType('audio/ogg; codecs="vorbis"'),
      opus: audio.canPlayType('audio/ogg; codecs="opus"')
    },
    mp3: audio.canPlayType('audio/mpeg'),
    wav: audio.canPlayType('audio/wav')
  };

  return support;
}

// Call this when your app initializes to help debug Safari issues
checkAudioSupport();

