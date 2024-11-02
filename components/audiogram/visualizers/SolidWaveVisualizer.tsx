import { VisualizerProps } from '../types';

export function SolidWaveVisualizer({ 
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
  
  const points = Array.from(dataArray)
    .slice(0, 64)
    .map(value => value / 255);

  // Create smooth path
  ctx.beginPath();
  ctx.moveTo(0, yPosition);

  // Draw top curve
  points.forEach((point, i) => {
    const x = (i / (points.length - 1)) * totalSize;
    const y = yPosition - (point * height);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = ((i - 1) / (points.length - 1)) * totalSize;
      const prevY = yPosition - (points[i - 1] * height);
      
      const cp1x = prevX + (x - prevX) * 0.5;
      const cp2x = prevX + (x - prevX) * 0.5;
      
      ctx.bezierCurveTo(cp1x, prevY, cp2x, y, x, y);
    }
  });

  // Complete the path back to start
  ctx.lineTo(totalSize, yPosition);
  ctx.lineTo(0, yPosition);
  
  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, yPosition - height, 0, yPosition);
  gradient.addColorStop(0, `${barColor}99`);
  gradient.addColorStop(1, barColor);
  
  ctx.fillStyle = gradient;
  ctx.fill();
} 