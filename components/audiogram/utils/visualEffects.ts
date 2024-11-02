import { GlowEffect, BackgroundOptions, FrequencyBand } from '../types';

export const FREQUENCY_BANDS: FrequencyBand[] = [
  { name: 'Sub Bass', range: [20, 60], color: '#FF0000' },
  { name: 'Bass', range: [60, 250], color: '#FF7F00' },
  { name: 'Low Mids', range: [250, 500], color: '#FFFF00' },
  { name: 'Mids', range: [500, 2000], color: '#00FF00' },
  { name: 'High Mids', range: [2000, 4000], color: '#0000FF' },
  { name: 'Presence', range: [4000, 6000], color: '#4B0082' },
  { name: 'Brilliance', range: [6000, 20000], color: '#9400D3' },
];

export function applyGlowEffect(
  ctx: CanvasRenderingContext2D, 
  effect: GlowEffect
) {
  if (!effect.enabled) return;
  
  ctx.shadowBlur = effect.intensity || 15;
  ctx.shadowColor = effect.color || ctx.fillStyle.toString();
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  options: BackgroundOptions,
  width: number,
  height: number
) {
  switch (options.type) {
    case 'gradient': {
      const gradient = ctx.createLinearGradient(
        0, 0,
        Math.cos(options.gradient?.angle || 0) * width,
        Math.sin(options.gradient?.angle || 0) * height
      );
      
      options.gradient?.colors.forEach((color, i) => {
        gradient.addColorStop(i / (options.gradient!.colors.length - 1), color);
      });
      
      ctx.fillStyle = gradient;
      break;
    }
    case 'solid':
      ctx.fillStyle = options.color || '#000000';
      break;
  }
  
  ctx.fillRect(0, 0, width, height);
  
  // Apply overlay if specified
  if (options.overlay) {
    ctx.fillStyle = options.overlay.color;
    ctx.globalAlpha = options.overlay.opacity;
    ctx.fillRect(0, 0, width, height);
    ctx.globalAlpha = 1;
  }
}

export function getFrequencyBandColor(
  frequency: number,
  intensity: number
): string {
  const band = FREQUENCY_BANDS.find(
    band => frequency >= band.range[0] && frequency <= band.range[1]
  );
  
  if (!band) return '#FFFFFF';
  
  // Adjust color based on intensity
  const rgb = hexToRgb(band.color);
  const alpha = intensity * 0.8 + 0.2; // Keep some minimal visibility
  
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
} 