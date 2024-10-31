import { AgentVisualizerBands } from '@/components/recording/visualizer/AgentVisualizerBands';
import styles from '@/components/recording/visualizer/AgentVisualizer.module.scss';

interface StandbyVisualizerProps {
  volumeBands: number[];
}

export function StandbyVisualizer({ volumeBands }: StandbyVisualizerProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="relative h-[360px] w-[360px]">
        <div className={`${styles['audio-band-visualizer']} absolute inset-0 flex items-center justify-center`}>
          <AgentVisualizerBands
            volumeBands={volumeBands}
            highlightedIndices={[]}
            minHeight={20}
            maxHeight={100}
          />
        </div>
      </div>
    </div>
  );
} 