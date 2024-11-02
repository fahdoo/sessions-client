import { VisualizerProps } from '../types';

export function WaveVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config
}: VisualizerProps) {
  const bottomThirdStart = canvas.height * 0.66;
  const visualizerHeight = canvas.height * (config?.visualizerHeight || 0.3);
  const centerY = bottomThirdStart + (visualizerHeight / 2);
  
  // Clear entire canvas to prevent clipping
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.beginPath();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = 1.5;
  
  // Use full width of canvas for points
  const points = Array.from(dataArray)
    .map(value => value / 255);
  
  // Draw frequency peaks across entire width
  for (let i = 0; i < canvas.width; i++) {
    // Map canvas position to data array index
    const dataIndex = Math.floor((i / canvas.width) * points.length);
    const point = points[dataIndex];
    
    const x = i;
    const amplitude = visualizerHeight * 0.8;
    const y = centerY - (point * amplitude);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
} 