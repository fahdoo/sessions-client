import * as React from 'react';
import { useMultibandTrackVolume, type AgentState } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useMaybeTrackRefContext } from '@livekit/components-react';
import { useBarAnimator } from './useBarAnimator';

interface AgentVisualizerProps extends React.HTMLProps<HTMLDivElement> {
  state?: AgentState;
  trackRef?: TrackReferenceOrPlaceholder;
  circleCount?: number;
}

const sequencerIntervals = new Map<AgentState, number>([
    ['connecting', 2000],
    ['initializing', 2000],
    ['listening', 500],
    ['thinking', 150],
  ]);
  
  const getSequencerInterval = (
    state: AgentState | undefined,
    barCount: number,
  ): number | undefined => {
    if (state === undefined) {
      return 1000;
    }
    let interval = sequencerIntervals.get(state);
    if (interval) {
      switch (state) {
        case 'connecting':
          // case 'thinking':
          interval /= barCount;
          break;
  
        default:
          break;
      }
    }
    return interval;
  };

export const AgentVisualizer = React.forwardRef<HTMLDivElement, AgentVisualizerProps>(
  function AgentVisualizer(
    { state, trackRef, circleCount = 5, ...props }: AgentVisualizerProps,
    ref,
  ) {
    const contextTrackRef = useMaybeTrackRefContext();
    const trackReference = trackRef || contextTrackRef;

    const volumeBands = useMultibandTrackVolume(trackReference, {
      bands: circleCount,
      loPass: 100,
      hiPass: 200,
    });

    const minHeight = 20;
    const maxHeight = 100;

    const highlightedIndices = useBarAnimator(
      state,
      circleCount,
      getSequencerInterval(state, circleCount) ?? 100,
    );

    return (
      <div ref={ref} {...props} data-lk-va-state={state} className="agent-visualizer" style={{ position: 'relative' }}>
        {volumeBands.map((volume, idx) => (
          <div
            key={idx}
            data-lk-highlighted={highlightedIndices.includes(idx)}
            data-lk-bar-index={idx}
            className={`lk-audio-bar  ${highlightedIndices.includes(idx) ? 'lk-highlighted' : ''}`}
            style={{
              width: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,
              height: `${Math.min(maxHeight, Math.max(minHeight, volume * 100 + 5))}%`,              
              opacity: 1 - idx * 0.15,
              position: 'absolute',
              bottom: 0,
              backgroundColor: 'white',
              transition: 'height 0.2s, opacity 0.2s',
            }}
          />
        ))}
      </div>
    );
  },
);
