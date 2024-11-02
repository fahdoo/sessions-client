import { VisualizerProps } from '../types';

export function SmoothWaveVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config = { 
    barColor, 
    backgroundColor: '#000000',
    visualizerHeight: 0.15,
    visualizerPosition: 0.8
  }
}: VisualizerProps) {
  const height = totalSize * (config?.visualizerHeight || 0.15);
  const yPosition = totalSize * (config?.visualizerPosition || 0.8);
  
  // Create smooth points
  const points = Array.from(dataArray)
    .slice(0, 64)
    .map(value => value / 255);
  
  // Apply smoothing
  const smoothedPoints = points.map((point, i) => {
    if (i === 0 || i === points.length - 1) return point;
    const prev = points[i - 1];
    const next = points[i + 1];
    return prev * 0.25 + point * 0.5 + next * 0.25;
  });

  // Draw path
  ctx.beginPath();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Use bezier curves for ultra-smooth line
  smoothedPoints.forEach((point, i) => {
    const x = (i / (smoothedPoints.length - 1)) * totalSize;
    const y = yPosition - (point * height);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = ((i - 1) / (smoothedPoints.length - 1)) * totalSize;
      const prevY = yPosition - (smoothedPoints[i - 1] * height);
      
      const cp1x = prevX + (x - prevX) * 0.5;
      const cp2x = prevX + (x - prevX) * 0.5;
      
      ctx.bezierCurveTo(cp1x, prevY, cp2x, y, x, y);
    }
  });
  
  ctx.stroke();
} 