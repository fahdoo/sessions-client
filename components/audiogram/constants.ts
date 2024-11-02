import { type ThemeColor } from './types';

export const THEME_COLORS: Record<ThemeColor, string> = {
  primary: '#6366f1', // slate-blue-500
  secondary: '#4F46E5',
  accent: '#818CF8',
} as const;

export const VISUALIZER_CONFIG = {
  bottomThird: 0.66, // Position for non-circular visualizers
  titleDuration: 3000, // Show title for 3 seconds at start
  glowIntensity: 15,
} as const; 