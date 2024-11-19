export const SPEAKER_COLORS = {
  // Speaker colors for text and waveform
  'ai-1': {
    text: '#93c5fd',    // Lighter blue for text
    wave: '#3b82f6',    // Darker blue for waveform
    label: 'AI'         // For debugging/reference
  },
  'user-1': {
    text: '#fed7aa',    // Lighter gray for text
    wave: '#fb923c',    // Darker gray for waveform
    label: 'User'       // For debugging/reference
  }
} as const;

// Default colors if no speaker is set
export const DEFAULT_COLORS = {
  text: '#cbd5e1',
  wave: '#64748b',
} as const;

// Animation timing constants
export const ANIMATION = {
  wordFadeInDuration: 10,   // frames
  sentenceFadeOutDuration: 15,  // frames
} as const; 