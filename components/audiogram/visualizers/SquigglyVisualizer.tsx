import { VisualizerProps } from '../types';

export function SquigglyVisualizer({ 
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

  ctx.beginPath();
  ctx.strokeStyle = barColor;
  ctx.lineWidth = 2;

  // Squiggly parameters
  let phase = 0;
  const frequency = 0.2; // Controls squiggle density
  const amplitude = visualizerHeight * 0.1; // Controls squiggle height

  // Draw using the full canvas width
  for (let i = 0; i < canvas.width; i++) {
    const dataIndex = Math.floor((i / canvas.width) * normalizedData.length);
    const point = normalizedData[dataIndex] || 0;
    
    // Calculate baseline position based on the audio data
    const baseline = centerY - (point * visualizerHeight * 0.4);
    
    // Add sine wave modulation
    const y = baseline + Math.sin(phase) * amplitude * Math.abs(point);
    const x = i;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      // Use quadratic curves for smoother lines
      const prevX = i - 1;
      const prevDataIndex = Math.floor((prevX / canvas.width) * normalizedData.length);
      const prevPoint = normalizedData[prevDataIndex] || 0;
      const prevBaseline = centerY - (prevPoint * visualizerHeight * 0.4);
      const prevY = prevBaseline + Math.sin(phase - frequency) * amplitude * Math.abs(prevPoint);
      
      const cpX = (x + prevX) / 2;
      ctx.quadraticCurveTo(cpX, prevY, x, y);
    }

    phase += frequency;
  }

  ctx.stroke();
} 