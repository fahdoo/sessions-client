'use client';

import { createContext, useContext, useRef, useCallback } from 'react';
import { setupMediaSession } from '@/lib/utils/audio';
import { browserCapabilities } from '@/lib/utils/browser-compatibility';

interface MediaArtwork {
  src: string;
  sizes: string;
  type: string;
}

interface MediaSessionParams {
  mediaElement: HTMLMediaElement;
  title: string;
  artist: string;
  artwork?: MediaArtwork[];
}

interface MediaSessionContextType {
  updateMediaSession: (params: MediaSessionParams) => void;
}

const MediaSessionContext = createContext<MediaSessionContextType>({
  updateMediaSession: () => {},
});

export function MediaSessionProvider({ children }: { children: React.ReactNode }) {
  const currentMediaElementRef = useRef<HTMLMediaElement | null>(null);

  const updateMediaSession = useCallback((params: MediaSessionParams) => {
    const { mediaElement, title, artist, artwork } = params;
    
    // Update ref to current media element
    currentMediaElementRef.current = mediaElement;

    // Set up media session only if supported
    if (browserCapabilities.hasMediaSession()) {
      // Set up media session
      setupMediaSession(mediaElement, {
        title,
        artist,
        artwork
      });

      // Clear any existing handlers first
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);

      // Set up media session handlers
      navigator.mediaSession.setActionHandler('play', () => {
        mediaElement.dispatchEvent(new Event('mediaSessionPlay'));
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        mediaElement.dispatchEvent(new Event('mediaSessionPause'));
      });
    }
  }, []);

  return (
    <MediaSessionContext.Provider value={{ updateMediaSession }}>
      {children}
    </MediaSessionContext.Provider>
  );
}

export const useMediaSession = () => useContext(MediaSessionContext);