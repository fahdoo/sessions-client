import { VisualizerProps } from '../types';

export function CircularVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config
}: VisualizerProps) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const baseRadius = Math.min(canvas.width, canvas.height) * 0.25;
  
  const points = Array.from(dataArray)
    .slice(0, 180)
    .map(value => value / 255);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw base circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
  ctx.strokeStyle = `${barColor}33`;
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // Draw frequency bars around the circle
  points.forEach((point, i) => {
    const angle = (i / points.length) * Math.PI * 2;
    const intensity = point * 0.5;
    const outerRadius = baseRadius + (baseRadius * intensity);
    
    const startX = centerX + Math.cos(angle) * baseRadius;
    const startY = centerY + Math.sin(angle) * baseRadius;
    const endX = centerX + Math.cos(angle) * outerRadius;
    const endY = centerY + Math.sin(angle) * outerRadius;
    
    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, `${barColor}99`);
    gradient.addColorStop(1, barColor);
    
    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
} 