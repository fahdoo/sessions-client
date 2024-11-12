import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { VisualizerProps, VisualizationType } from '../types';

type WaveSurferVisualizerProps = Omit<VisualizerProps, 'dataArray' | 'totalSize' | 'ctx'> & {
  visualizationType: VisualizationType;
  audioUrl: string;
};

export function WaveSurferVisualizer({ 
  canvas,
  barColor,
  config,
  visualizationType = 'wave',
  audioUrl
}: WaveSurferVisualizerProps) {
  const wavesurferRef = useRef<WaveSurfer>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !audioUrl) return;

    let isDestroyed = false;

    const initializeWaveSurfer = async () => {
      try {
        if (wavesurferRef.current) {
          wavesurferRef.current.destroy();
          wavesurferRef.current = undefined;
        }

        const container = containerRef.current;
        if (!container) return;

        // Get visualization-specific options
        const visualizationOptions = (() => {
          switch (visualizationType) {
            case 'bars':
              return {
                waveColor: barColor,
                progressColor: barColor,
                barWidth: config?.barWidth || 2,
                barGap: config?.barSpacing || 1,
                barRadius: config?.cornerRadius || 2,
                height: 128,
                cursorWidth: 0,
                normalize: true,
                interact: false,
                // Use bars renderer
                wave: false,
                bars: true
              };
            case 'filledWave':
              return {
                waveColor: `${barColor}99`,
                progressColor: barColor,
                height: 128,
                cursorWidth: 0,
                normalize: true,
                interact: false,
                // Use wave renderer with fill
                wave: true,
                bars: false,
                fillParent: true,
                barHeight: 1,
                barWidth: 1,
                barGap: 0
              };
            case 'squiggly':
              return {
                waveColor: barColor,
                progressColor: barColor,
                height: 128,
                cursorWidth: 0,
                normalize: true,
                interact: false,
                // Custom render function for squiggly
                renderFunction: (peaks: Array<Float32Array | number[]>, ctx: CanvasRenderingContext2D) => {
                  const width = ctx.canvas.width;
                  const height = ctx.canvas.height;
                  const centerY = height / 2;

                  ctx.clearRect(0, 0, width, height);
                  ctx.beginPath();
                  ctx.strokeStyle = barColor;
                  ctx.lineWidth = 2;

                  let phase = 0;
                  const frequency = 0.2;
                  const amplitude = height * 0.1;

                  const flatPeaks = peaks.reduce<number[]>((acc, curr) => {
                    const values = Array.isArray(curr) ? curr : Array.from(curr);
                    return [...acc, ...values];
                  }, []);

                  for (let i = 0; i < width; i++) {
                    const peakIndex = Math.floor((i / width) * flatPeaks.length);
                    const peak = flatPeaks[peakIndex] || 0;
                    const baseline = centerY + (peak * height * 0.4);
                    const y = baseline + Math.sin(phase) * amplitude * Math.abs(peak);

                    if (i === 0) {
                      ctx.moveTo(i, y);
                    } else {
                      ctx.lineTo(i, y);
                    }

                    phase += frequency;
                  }

                  ctx.stroke();
                }
              };
            default:
              return {
                waveColor: barColor,
                progressColor: barColor,
                height: 128,
                cursorWidth: 0,
                normalize: true,
                interact: false,
                // Use wave renderer
                wave: true,
                bars: false,
                barWidth: 1,
                barGap: 0
              };
          }
        })();

        // Create WaveSurfer instance
        wavesurferRef.current = WaveSurfer.create({
          container,
          ...visualizationOptions,
          // Hide timeline
          hideScrollbar: true,
          url: audioUrl
        });

        wavesurferRef.current.on('ready', () => {
          if (!isDestroyed) {
            console.log('WaveSurfer visualization ready');
          }
        });

        wavesurferRef.current.on('error', (err) => {
          if (!isDestroyed) {
            console.error('WaveSurfer error:', err);
          }
        });

      } catch (err) {
        if (!isDestroyed) {
          console.error('Error creating WaveSurfer:', err);
        }
      }
    };

    initializeWaveSurfer();

    return () => {
      isDestroyed = true;
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.destroy();
          wavesurferRef.current = undefined;
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };
  }, [audioUrl, barColor, config?.barWidth, config?.barSpacing, config?.cornerRadius, visualizationType]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full"
      style={{ 
        minHeight: '128px',
        background: 'transparent',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0
      }}
    />
  );
} 