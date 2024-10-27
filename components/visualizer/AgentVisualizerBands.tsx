import React from 'react';
import styles from './AgentVisualizer.module.scss';

interface AgentVisualizerBandsProps {
  volumeBands: number[];
  highlightedIndices: number[];
  minHeight: number;
  maxHeight: number;
  children?: React.ReactNode;
}

const getBandDimension = (min: number, max: number, volume: number, numVolumes: number, idx: number) => {
  const range = max - min;
  const step = range / numVolumes;
  const circleMin = min + (idx * step);
  const circleMax = circleMin + step;
  
  return `${Math.min(circleMax, Math.max(circleMin, circleMin + (volume * step)) * 1.5)}%`;
};

const getBandOpacity  = (idx: number, numBands: number, highlighted: boolean) => {
  return highlighted ? 1 : 1 - (idx * 0.9/numBands);
};

export const AgentVisualizerBands: React.FC<AgentVisualizerBandsProps> = ({
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
              position: 'absolute',
              height: getBandDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              width: getBandDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              opacity: getBandOpacity(idx, volumeBands.length, highlightedIndices.includes(idx)),
            },
          })
        ) : (
          <span
            key={idx}
            data-lk-highlighted={highlightedIndices.includes(idx)}
            data-lk-bar-index={idx}
            className={`${styles['audio-bar']} ${highlightedIndices.includes(idx) ? styles['highlighted'] : ''}`}
            style={{
              position: 'absolute',
              height: getBandDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              width: getBandDimension(minHeight, maxHeight, volume, volumeBands.length, idx),
              opacity: getBandOpacity(idx, volumeBands.length, highlightedIndices.includes(idx)),
            }}
          ></span>
        )
      )}
    </>
  );
};
