import { VisualizerProps } from '../types';

export function BarsVisualizer({ 
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
  
  const bands = Array.from(dataArray)
    .slice(0, 32)
    .map(value => value / 255);
  
  // Use config values or defaults
  const barSpacing = config?.barSpacing || 2;
  const barWidth = (canvas.width / bands.length) - barSpacing;
  const cornerRadius = config?.cornerRadius || 4;
  
  // Clear the visualization area
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  bands.forEach((band, i) => {
    const x = i * (barWidth + barSpacing);
    const height = band * (visualizerHeight / 2); // Half height for symmetry
    
    // Draw top bar (upward)
    drawRoundedBar(ctx, x, centerY - height, barWidth, height, cornerRadius, barColor);
    
    // Draw bottom bar (downward)
    drawRoundedBar(ctx, x, centerY, barWidth, height, cornerRadius, barColor);
  });
}

function drawRoundedBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  
  // Top left corner
  ctx.moveTo(x + radius, y);
  
  // Top right corner
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  
  // Bottom right corner
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  
  // Bottom left corner
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  
  // Back to top left
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  
  ctx.fill();
} 