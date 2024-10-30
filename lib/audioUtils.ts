import { convertS3UrlToHttps } from '@/lib/utils';

export const fetchAudioUrl = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is missing");
  }

  try {
    const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch audio (${response.status})`);
    }

    if (response.status === 202) {
      throw new Error(data.message || "Audio processing in progress");
    }

    if (!data.url) {
      throw new Error("No audio URL returned from server");
    }

    return convertS3UrlToHttps(data.url);
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
      const response = await fetch(url, { method: 'HEAD' });
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

export function setupMediaSession(audio: HTMLAudioElement, metadata: {
  title: string;
  artist: string;
  artwork?: string;
}) {
  if ('mediaSession' in navigator) {
    const artworkUrl = metadata.artwork ? 
      new URL(metadata.artwork, window.location.origin).toString() : 
      undefined;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: metadata.title,
      artist: metadata.artist,
      artwork: artworkUrl ? [
        { src: artworkUrl, sizes: '96x96', type: 'image/png' },
        { src: artworkUrl, sizes: '128x128', type: 'image/png' },
      ] : undefined
    });

    // Set up media session handlers
    navigator.mediaSession.setActionHandler('play', () => {
      audio.play();
    });
    
    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
    });
    
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        audio.currentTime = details.seekTime;
      }
    });

    // Update position state periodically
    const updatePositionState = () => {
      if ('setPositionState' in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration || 0,
          position: audio.currentTime || 0,
          playbackRate: audio.playbackRate,
        });
      }
    };

    audio.addEventListener('timeupdate', updatePositionState);
    audio.addEventListener('durationchange', updatePositionState);
    
    // Return cleanup function
    return () => {
      audio.removeEventListener('timeupdate', updatePositionState);
      audio.removeEventListener('durationchange', updatePositionState);
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('seekto', null);
    };
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
  audio.addEventListener('play', callbacks.onPlay || (() => {}));
  audio.addEventListener('pause', callbacks.onPause || (() => {}));
  audio.addEventListener('ended', callbacks.onEnded || (() => {}));

  // Return cleanup function
  return () => {
    audio.removeEventListener('play', callbacks.onPlay || (() => {}));
    audio.removeEventListener('pause', callbacks.onPause || (() => {}));
    audio.removeEventListener('ended', callbacks.onEnded || (() => {}));
  };
}

