import React from 'react';
import styles from './AgentVisualizer.module.scss';

interface BarVisualizerBarsProps {
  volumeBands: number[];
  highlightedIndices: number[];
  minHeight: number;
  maxHeight: number;
  children?: React.ReactNode;
}

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
            style: { height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%` },
          })
        ) : (
          <span
            key={idx}
            data-lk-highlighted={highlightedIndices.includes(idx)}
            data-lk-bar-index={idx}
            className={`${styles['audio-bar']} ${highlightedIndices.includes(idx) ? styles['highlighted'] : ''}`}
            style={{
              height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,
            }}
          ></span>
        )
      )}
    </>
  );
};
