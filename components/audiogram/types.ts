import { Session } from '@/lib/types';

export type ThemeColor = 'primary' | 'secondary' | 'accent';

export type VisualizationType = 
  | 'Wave'
  | 'Cubes'
  | 'Lines'
  | 'Square';

export interface GlowEffect {
  enabled: boolean;
  intensity: number;
  color?: string;
}

export interface BackgroundOptions {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    colors: string[];
    angle: number;
  };
  overlay?: {
    opacity: number;
    color: string;
  };
}

export interface FrequencyBand {
  name: string;
  range: [number, number]; // Hz
  color: string;
}

export interface VisualizerProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  dataArray: Uint8Array;
  totalSize: number;
  barColor: string;
  position?: 'top' | 'center' | 'bottom';
  glow?: GlowEffect;
  background?: BackgroundOptions;
  highlightBands?: boolean;
  config?: VisualizerConfig;
}

export interface AudiogramVisualizerProps {
  sessionId: string;
  backgroundColor?: string;
  barColor?: string;
  overlay?: React.ReactNode;
  session: Session;
  visualizationType?: VisualizationType;
  onVisualizationTypeChange?: (type: VisualizationType) => void;
  onColorChange?: (color: string) => void;
  config: VisualizerConfig;
  onConfigChange: (config: Partial<VisualizerConfig>) => void;
}

export interface VisualizerConfig {
  barColor: string;
  visualizerHeight: number;
  visualizerPosition?: number;
  titleFont?: string;
  titleSize?: number;
  titleColor?: string;
  titlePosition?: number;
  transcriptSize?: number;
  transcriptColor?: string;
  transcriptPosition?: number;
  transcriptMaxLines?: number;
  barWidth?: number;
  barSpacing?: number;
  cornerRadius?: number;
  backgroundImage?: string;
  glowIntensity?: number;

  // Musicolors specific options
  // musicolorsMode?: 'circle' | 'flower' | 'spiral';
  // rotationSpeed?: number;
  // particleCount?: number;
  // particleSize?: number;
  // particleSpeed?: number;
  // smoothing?: number;

  titleOpacity?: number;
  transcriptOpacity?: number;
  visualizerOpacity?: number;
}

export interface WaveSurferOptions {
  container: HTMLElement;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  cursorColor?: string;
  cursorWidth?: number;
  barWidth?: number;
  barGap?: number;
  barRadius?: number;
  barHeight?: number;
  minPxPerSec?: number;
  fillParent?: boolean;
  mediaControls?: boolean;
  autoplay?: boolean;
  normalize?: boolean;
  splitChannels?: boolean;
  interact?: boolean;
  hideScrollbar?: boolean;
  audioRate?: number;
  autoScroll?: boolean;
  autoCenter?: boolean;
  sampleRate?: number;
  backend?: string;
  mediaType?: string;
  peaks?: number[][];
  duration?: number;
  url?: string | Blob | File | AudioBuffer;
  plugins?: any[];
  rendering?: {
    waveColor?: string;
    progressColor?: string;
    barWidth?: number;
    barGap?: number;
    barRadius?: number;
    wave?: boolean;
    bars?: boolean;
  };
}