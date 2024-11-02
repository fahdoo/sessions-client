import { VisualizerProps } from '../types';

export function FilledWaveVisualizer({ 
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
  
  ctx.clearRect(0, bottomThirdStart, canvas.width, canvas.height - bottomThirdStart);
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, bottomThirdStart, 0, bottomThirdStart + visualizerHeight);
  gradient.addColorStop(0, `${barColor}33`);
  gradient.addColorStop(1, barColor);
  
  ctx.beginPath();
  ctx.moveTo(0, centerY);
  
  // Draw top half of the wave
  for (let x = 0; x <= canvas.width; x++) {
    const progress = x / canvas.width;
    const dataIndex = Math.floor(progress * dataArray.length);
    const amplitude = (dataArray[dataIndex] / 255) * (visualizerHeight * 0.4);
    
    // Pure sine wave with amplitude modulation
    const frequency = 6; // Controls wave density
    const y = centerY - Math.sin(progress * Math.PI * frequency) * amplitude;
    
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  // Draw bottom half (mirror)
  for (let x = canvas.width; x >= 0; x--) {
    const progress = x / canvas.width;
    const dataIndex = Math.floor(progress * dataArray.length);
    const amplitude = (dataArray[dataIndex] / 255) * (visualizerHeight * 0.4);
    
    const frequency = 6;
    const y = centerY + Math.sin(progress * Math.PI * frequency) * amplitude;
    
    ctx.lineTo(x, y);
  }
  
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
} 