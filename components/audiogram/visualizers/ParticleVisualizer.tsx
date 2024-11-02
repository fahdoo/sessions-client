import { VisualizerProps } from '../types';

export function ParticleVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config
}: VisualizerProps) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(canvas.width, canvas.height) * 0.25;
  
  const points = Array.from(dataArray)
    .slice(0, 180)
    .map(value => value / 255);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  points.forEach((point, i) => {
    const angle = (i / points.length) * Math.PI * 2;
    const intensity = point * 0.8;
    const distance = radius + (radius * intensity * Math.sin(Date.now() * 0.001 + i * 0.1));
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    const particleSize = point * 5;
    
    ctx.beginPath();
    ctx.arc(x, y, particleSize, 0, Math.PI * 2);
    ctx.fillStyle = `${barColor}${Math.floor(intensity * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
  });
} 