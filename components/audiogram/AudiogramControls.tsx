import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { THEME_COLORS } from './constants';
import { VisualizationType, GlowEffect, BackgroundOptions, VisualizerConfig } from './types';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface AudiogramControlsProps {
  visualizationType: VisualizationType;
  onVisualizationTypeChange: (type: VisualizationType) => void;
  color: string;
  onColorChange: (color: string) => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  glow?: GlowEffect;
  onGlowChange?: (effect: GlowEffect) => void;
  highlightBands?: boolean;
  onHighlightBandsChange?: (enabled: boolean) => void;
  background?: BackgroundOptions;
  onBackgroundChange?: (options: BackgroundOptions) => void;
  backgroundImage?: string;
  onBackgroundImageChange?: (imageUrl: string) => void;
  config?: Partial<VisualizerConfig>;
  onConfigChange: (config: Partial<VisualizerConfig>) => void;
}

const VISUALIZATION_TYPES = [
  { type: 'bars' as const, label: 'Bars' },
  { type: 'wave' as const, label: 'Wave' },
  { type: 'circular' as const, label: 'Circular' },
  { type: 'line' as const, label: 'Line' }
] as const;

export function AudiogramControls({
  visualizationType,
  onVisualizationTypeChange,
  color,
  onColorChange,
  isRecording,
  onStartRecording,
  onStopRecording,
  glow,
  onGlowChange,
  highlightBands,
  onHighlightBandsChange,
  background,
  onBackgroundChange,
  backgroundImage,
  onBackgroundImageChange,
  config,
  onConfigChange,
}: AudiogramControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-2">
        {VISUALIZATION_TYPES.map(({ type, label }) => (
          <Button
            key={type}
            onClick={() => onVisualizationTypeChange(type)}
            variant={visualizationType === type ? 'default' : 'outline'}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Color:</label>
          <Input
            type="color"
            value={color}
            onChange={(e) => onColorChange(e.target.value)}
            className="w-20 h-8 p-1"
          />
        </div>
        
        {/* Quick color presets */}
        <div className="flex gap-2">
          {Object.entries(THEME_COLORS).map(([name, value]) => (
            <Button
              key={name}
              onClick={() => onColorChange(value)}
              className="w-8 h-8 p-0 rounded-full"
              style={{ backgroundColor: value }}
              variant="outline"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Title Font</label>
          <Select
            value={config?.titleFont}
            onValueChange={value => onConfigChange({ titleFont: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select font" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sans-serif">Sans Serif</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label>Background Type</label>
          <Select
            value={background?.type}
            onValueChange={(value) => 
              onBackgroundChange?.({ ...background, type: value as 'solid' | 'gradient' })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Background Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {background?.type === 'gradient' && (
        <div className="flex gap-2">
          {background.gradient?.colors.map((color, i) => (
            <Input
              key={i}
              type="color"
              value={color}
              onChange={(e) => {
                if (!background.gradient?.colors) return;
                const newColors = [...background.gradient.colors];
                newColors[i] = e.target.value;
                onBackgroundChange?.({
                  ...background,
                  gradient: { ...background.gradient, colors: newColors }
                });
              }}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Switch
          checked={glow?.enabled}
          onCheckedChange={(checked) => 
            onGlowChange?.({ 
              enabled: checked, 
              intensity: glow?.intensity || 15 
            })
          }
        />
        <label>Glow Effect</label>
        
        {glow?.enabled && (
          <Slider
            value={[glow.intensity || 15]}
            min={5}
            max={30}
            step={1}
            onValueChange={([value]) => 
              onGlowChange?.({ 
                ...glow, 
                intensity: value 
              })
            }
          />
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Switch
          checked={highlightBands}
          onCheckedChange={onHighlightBandsChange}
        />
        <label>Frequency Bands</label>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={onStartRecording}
          disabled={isRecording}
          variant="default"
        >
          Start Recording
        </Button>
        <Button
          onClick={onStopRecording}
          disabled={!isRecording}
          variant="destructive"
        >
          Stop Recording
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Background:</label>
        <Input
          type="text"
          value={backgroundImage}
          onChange={(e) => onBackgroundImageChange?.(e.target.value)}
          placeholder="Image URL"
          className="flex-1"
        />
      </div>

      <div>
        <label>Title Size</label>
        <Input 
          type="number" 
          value={config?.titleSize ?? 24}
          onChange={e => onConfigChange({ titleSize: Number(e.target.value) })}
        />
      </div>

      <div>
        <label>Visualizer Height (%)</label>
        <Slider
          value={[config?.visualizerHeight ? config.visualizerHeight * 100 : 15]}
          onValueChange={([value]) => onConfigChange({ visualizerHeight: value / 100 })}
          min={5}
          max={50}
        />
      </div>
    </div>
  );
} 