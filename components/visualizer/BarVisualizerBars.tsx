import React from 'react';
import styles from './AgentVisualizer.module.scss';

interface BarVisualizerBarsProps {
  volumeBands: number[];
  highlightedIndices: number[];
  minHeight: number;
  maxHeight: number;
  children?: React.ReactNode;
}

const getBarDimension = (min: number, max: number, volume: number, numVolumes: number, idx: number) => {
  const range = max - min;
  const step = range / numVolumes;
  const circleMin = min + (idx * step);
  const circleMax = circleMin + step;
  
  return `${Math.min(circleMax, Math.max(circleMin, circleMin + (volume * step)))}%`;
};

export const BarVisualizerBars: React.FC<BarVisualizerBarsProps> = ({
  volumeBands,
  highlightedIndices,
  minHeight,
  maxHeight,
  children,
}) => {
  return (
    <>
      {volumeBands.map((volume, idx) =>
        children ? (
          React.cloneElement(React.Children.only(children) as React.ReactElement, {
            key: idx,
            'data-lk-highlighted': highlightedIndices.includes(idx),
            'data-lk-bar-index': idx,
            className: `${styles['audio-bar']} ${highlightedIndices.includes(idx) ? styles['highlighted'] : ''}`,
            style: { 
              height: getBarDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              width: getBarDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              position: 'absolute',
              opacity: highlightedIndices.includes(idx) ? 1 : 1 - (idx * 0.175),
            },
          })
        ) : (
          <span
            key={idx}
            data-lk-highlighted={highlightedIndices.includes(idx)}
            data-lk-bar-index={idx}
            className={`${styles['audio-bar']} ${highlightedIndices.includes(idx) ? styles['highlighted'] : ''}`}
            style={{
              height: getBarDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              width: getBarDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              position: 'absolute',
              opacity: highlightedIndices.includes(idx) ? 1 : 1 - (idx * 0.175),
            }}
          ></span>
        )
      )}
    </>
  );
};
