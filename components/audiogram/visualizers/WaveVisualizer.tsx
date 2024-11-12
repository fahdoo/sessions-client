import { VisualizerProps } from '../types';

export function WaveVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config
}: VisualizerProps) {
  // Set minimum amplitude for silence
  const NOISE_THRESHOLD = 0.05;
  
  // Use full frequency range
  const normalizedData = Array.from(dataArray).map((value, index) => {
    const normalized = value / 255;
    // Apply noise gate
    return normalized < NOISE_THRESHOLD ? 0 : normalized;
  });

  const visualizerHeight = canvas.height * (config?.visualizerHeight || 0.3);
  const bottomPadding = 24;
  const centerY = canvas.height - (visualizerHeight / 2) - bottomPadding;

  ctx.beginPath();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = 2;

  // Draw using the full canvas width
  const points = normalizedData.length;
  for (let i = 0; i < canvas.width; i++) {
    const dataIndex = Math.floor((i / canvas.width) * points);
    const point = normalizedData[dataIndex] || 0;
    
    const x = i;
    const amplitude = visualizerHeight * 0.8;
    const y = centerY - (point * amplitude);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = i - 1;
      const prevDataIndex = Math.floor((prevX / canvas.width) * points);
      const prevPoint = normalizedData[prevDataIndex] || 0;
      const prevY = centerY - (prevPoint * amplitude);
      
      // Use quadratic curves for smoothing
      const cpX = (x + prevX) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    }
  }

  ctx.stroke();
} 