import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { VisualizerConfig, VisualizationType } from './types';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface AudiogramSettingsSidebarProps {
  config: VisualizerConfig;
  onConfigChange: (config: Partial<VisualizerConfig>) => void;
  visualizationType: VisualizationType;
  onVisualizationTypeChange: (type: VisualizationType) => void;
}

export function AudiogramSettingsSidebar({
  config,
  onConfigChange,
  visualizationType,
  onVisualizationTypeChange,
}: AudiogramSettingsSidebarProps) {
  const { collapsed, setCollapsed } = useSidebar();

  return (
    <aside 
      className={cn(
        "w-[320px] border-l bg-background transition-all duration-300",
        collapsed && "w-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className={cn("font-semibold transition-opacity", 
          collapsed && "opacity-0"
        )}>
          Audiogram Settings
        </h3>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-accent rounded-md"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      <div className={cn("space-y-4 p-4", collapsed && "hidden")}>
        {/* Visualization Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Visualization</label>
          <div className="grid grid-cols-2 gap-2">
            {['bars', 'wave', 'filledWave', 'line', 'circular', 'agent'].map((type) => (
              <button
                key={type}
                onClick={() => onVisualizationTypeChange(type as VisualizationType)}
                className={cn(
                  "px-3 py-2 rounded-md",
                  visualizationType === type 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-accent hover:bg-accent/80"
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Visualization Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Visualization</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Input
              type="color"
              value={config.barColor}
              onChange={(e) => onConfigChange({ barColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Height (%)</label>
            <Slider
              value={[config.visualizerHeight * 100]}
              onValueChange={([value]) => onConfigChange({ visualizerHeight: value / 100 })}
              min={10}
              max={50}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Position (%)</label>
            <Slider
              value={[config.visualizerPosition ? config.visualizerPosition * 100 : 66]}
              onValueChange={([value]) => onConfigChange({ visualizerPosition: value / 100 })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        {/* Title Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Title</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <Slider
              value={[config.titleSize || 32]}
              onValueChange={([value]) => onConfigChange({ titleSize: value })}
              min={16}
              max={48}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Input
              type="color"
              value={config.titleColor || '#FFFFFF'}
              onChange={(e) => onConfigChange({ titleColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Position (%)</label>
            <Slider
              value={[config.titlePosition ? config.titlePosition * 100 : 20]}
              onValueChange={([value]) => onConfigChange({ titlePosition: value / 100 })}
              min={0}
              max={100}
              step={1}
            />
          </div>
        </div>

        {/* Transcript Settings */}
        <div className="space-y-4">
          <h4 className="font-medium">Transcript</h4>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <Slider
              value={[config.transcriptSize || 24]}
              onValueChange={([value]) => onConfigChange({ transcriptSize: value })}
              min={12}
              max={36}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <Input
              type="color"
              value={config.transcriptColor || '#FFFFFF'}
              onChange={(e) => onConfigChange({ transcriptColor: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Position (%)</label>
            <Slider
              value={[config.transcriptPosition ? config.transcriptPosition * 100 : 50]}
              onValueChange={([value]) => onConfigChange({ transcriptPosition: value / 100 })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Max Lines</label>
            <Slider
              value={[config.transcriptMaxLines || 6]}
              onValueChange={([value]) => onConfigChange({ transcriptMaxLines: value })}
              min={1}
              max={10}
              step={1}
            />
          </div>
        </div>

        {/* Bar Settings */}
        {visualizationType === 'bars' && (
          <div className="space-y-4">
            <h4 className="font-medium">Bar Style</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Bar Width</label>
              <Slider
                value={[config.barWidth || 20]}
                onValueChange={([value]) => onConfigChange({ barWidth: value })}
                min={5}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bar Spacing</label>
              <Slider
                value={[config.barSpacing || 2]}
                onValueChange={([value]) => onConfigChange({ barSpacing: value })}
                min={0}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Corner Radius</label>
              <Slider
                value={[config.cornerRadius || 4]}
                onValueChange={([value]) => onConfigChange({ cornerRadius: value })}
                min={0}
                max={20}
                step={1}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
} 