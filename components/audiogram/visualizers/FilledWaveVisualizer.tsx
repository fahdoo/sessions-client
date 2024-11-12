import { VisualizerProps } from '../types';

export function FilledWaveVisualizer({ 
  ctx, 
  canvas, 
  dataArray, 
  totalSize,
  barColor,
  config
}: VisualizerProps) {
  const NOISE_THRESHOLD = 0.05;
  
  // Normalize and apply noise gate
  const normalizedData = Array.from(dataArray).map(value => {
    const normalized = value / 255;
    return normalized < NOISE_THRESHOLD ? 0 : normalized;
  });

  const visualizerHeight = canvas.height * (config?.visualizerHeight || 0.3);
  const bottomPadding = 24;
  const centerY = canvas.height - (visualizerHeight / 2) - bottomPadding;

  // Create gradient
  const gradient = ctx.createLinearGradient(0, centerY - visualizerHeight/2, 0, centerY + visualizerHeight/2);
  gradient.addColorStop(0, `${barColor}99`);
  gradient.addColorStop(0.5, barColor);
  gradient.addColorStop(1, `${barColor}99`);

  ctx.beginPath();
  ctx.moveTo(0, centerY);

  // Draw top curve
  for (let i = 0; i < canvas.width; i++) {
    const dataIndex = Math.floor((i / canvas.width) * normalizedData.length);
    const point = normalizedData[dataIndex] || 0;
    const x = i;
    const amplitude = visualizerHeight * 0.4;
    const y = centerY - (point * amplitude);

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevX = i - 1;
      const prevDataIndex = Math.floor((prevX / canvas.width) * normalizedData.length);
      const prevPoint = normalizedData[prevDataIndex] || 0;
      const prevY = centerY - (prevPoint * amplitude);
      
      const cpX = (x + prevX) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    }
  }

  // Draw bottom curve (mirror)
  for (let i = canvas.width - 1; i >= 0; i--) {
    const dataIndex = Math.floor((i / canvas.width) * normalizedData.length);
    const point = normalizedData[dataIndex] || 0;
    const x = i;
    const amplitude = visualizerHeight * 0.4;
    const y = centerY + (point * amplitude);

    const prevX = i + 1;
    const prevDataIndex = Math.floor((prevX / canvas.width) * normalizedData.length);
    const prevPoint = normalizedData[prevDataIndex] || 0;
    const prevY = centerY + (prevPoint * amplitude);
    
    const cpX = (x + prevX) / 2;
    ctx.quadraticCurveTo(cpX, prevY, x, y);
  }

  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
} 