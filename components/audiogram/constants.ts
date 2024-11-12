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

export const DEFAULT_CONFIG = {
  barColor: '#FFFFFF',
  visualizerHeight: 0.3,
  visualizerPosition: 0.8, // Position from top (0 to 1)
  titleSize: 16, // Reduced from 24
  titleColor: '#FFFFFF',
  titlePosition: 0.2,
  transcriptSize: 20, // Smaller default transcript size
  transcriptColor: '#FFFFFF',
  transcriptPosition: 0.5,
  transcriptMaxLines: 3,
  barWidth: 2,
  barSpacing: 1,
  cornerRadius: 2
}; 