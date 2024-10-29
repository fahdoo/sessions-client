import * as React from 'react';
import { useMultibandTrackVolume, type AgentState } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-core';
import { useMaybeTrackRefContext } from '@livekit/components-react';
import { useBandAnimator } from '@/components/visualizer/useBandAnimator';
import { mergeProps } from '@/components/visualizer/visualizerUtils';
import { AgentVisualizerBands } from '@/components/visualizer/AgentVisualizerBands';
import styles from './AgentVisualizer.module.scss';

/**
 * @beta
 */
export type AgentVisualizerOptions = {
  /** in percentage */
  maxHeight?: number;
  /** in percentage */
  minHeight?: number;
};

/**
 * @beta
 */
export interface AgentVisualizerProps extends React.HTMLProps<HTMLDivElement> {
  /** If set, the visualizer will transition between different voice assistant states */
  state?: AgentState;
  /** Number of bars that show up in the visualizer */
  bandCount?: number;
  trackRef?: TrackReferenceOrPlaceholder;
  options?: AgentVisualizerOptions;
  /** The template component to be used in the visualizer. */
  children?: React.ReactNode;
}

const sequencerIntervals = new Map<AgentState, number>([
  ['connecting', 2000],
  ['initializing', 2000],
  ['listening', 500],
  ['thinking', 150],
]);

const getSequencerInterval = (
  state: AgentState | undefined,
  bandCount: number,
): number | undefined => {
  if (state === undefined) {
    return 1000;
  }
  let interval = sequencerIntervals.get(state);
  if (interval) {
    switch (state) {
      case 'connecting':
        // case 'thinking':
        interval /= bandCount;
        break;

      default:
        break;
    }
  }
  return interval;
};
/**
 * Visualizes audio signals from a TrackReference as bars.
 * If the `state` prop is set, it automatically transitions between VoiceAssistant states.
 * @beta
 *
 * @remarks For VoiceAssistant state transitions this component requires a voice assistant agent running with livekit-agents \>= 0.9.0
 *
 * @example
 * ```tsx
 * function SimpleVoiceAssistant() {
 *   const { state, audioTrack } = useVoiceAssistant();
 *   return (
 *    <AgentVisualizer
 *      state={state}
 *      trackRef={audioTrack}
 *    />
 *   );
 * }
 * ```
 */
export const AgentVisualizer = /* @__PURE__ */ React.forwardRef<HTMLDivElement, AgentVisualizerProps>(
  function AgentVisualizer(
    { state, options, bandCount = 5, trackRef, children, ...props }: AgentVisualizerProps,
    ref,
  ) {
    const elementProps = mergeProps(props, { 
      className: `${styles['audio-band-visualizer']} ${props.className || ''}` 
    });
    let trackReference = useMaybeTrackRefContext();

    if (trackRef) {
      trackReference = trackRef;
    }

    const volumeBands = useMultibandTrackVolume(trackReference, {
      bands: bandCount,
      loPass: 100,
      hiPass: 200,
    });
    const minHeight = options?.minHeight ?? (100 / volumeBands.length);
    const maxHeight = options?.maxHeight ?? 100;

    const highlightedIndices = useBandAnimator(
      state,
      bandCount,
      getSequencerInterval(state, bandCount) ?? 100,
    );

    return (
      <div ref={ref} {...elementProps} data-lk-va-state={state}>
        <AgentVisualizerBands
          volumeBands={volumeBands}
          highlightedIndices={highlightedIndices}
          minHeight={minHeight}
          maxHeight={maxHeight}
        />
      </div>
    );
  },
);
