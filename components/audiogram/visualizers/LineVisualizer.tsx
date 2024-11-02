import { VisualizerProps } from '../types';

export function LineVisualizer({ 
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
  
  const points = Array.from(dataArray)
    .slice(0, 64)
    .map(value => value / 255);
  
  ctx.clearRect(0, bottomThirdStart, canvas.width, canvas.height - bottomThirdStart);
  
  ctx.beginPath();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = 3;
  
  points.forEach((point, i) => {
    const x = (i / points.length) * canvas.width;
    const amplitude = visualizerHeight * 0.5;
    const y = centerY + (point - 0.5) * amplitude;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = ((i - 1) / points.length) * canvas.width;
      const prevY = centerY + (points[i - 1] - 0.5) * amplitude;
      const cpX = (x + prevX) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    }
  });
  
  ctx.stroke();
} 