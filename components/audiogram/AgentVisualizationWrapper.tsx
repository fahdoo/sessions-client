import { AgentVisualizerBands } from '../recording/visualizer/AgentVisualizerBands';

interface AgentVisualizationWrapperProps {
  volumeBands: number[];
  minHeight?: number;
  maxHeight?: number;
}

export function AgentVisualizationWrapper({
  volumeBands,
  minHeight = 20,
  maxHeight = 80
}: AgentVisualizationWrapperProps) {
  return (
    <div className="absolute inset-0 bg-slate-800">
      <AgentVisualizerBands
        volumeBands={volumeBands}
        highlightedIndices={[]}
        minHeight={minHeight}
        maxHeight={maxHeight}
      >
        <div className="rounded-full bg-indigo-500/20" />
      </AgentVisualizerBands>
    </div>
  );
} 