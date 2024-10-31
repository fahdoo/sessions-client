import { createContext } from 'react';

interface PlayerContextType {
  playingSessionId: string | null;
  setPlayingSessionId: (id: string | null) => void;
}

export const PlayerContext = createContext<PlayerContextType>({
  playingSessionId: null,
  setPlayingSessionId: () => {},
}); 