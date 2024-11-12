import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VisualizerConfig, VisualizationType } from './types';
import { Settings, Video, Wand2, Type, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/use-media-query';

interface AudiogramSettingsSidebarProps {
  config: VisualizerConfig;
  onConfigChange: (config: Partial<VisualizerConfig>) => void;
  visualizationType: VisualizationType;
  onVisualizationTypeChange: (type: VisualizationType) => void;
  isRecording?: boolean;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export function AudiogramSettingsSidebar({
  config,
  onConfigChange,
  visualizationType,
  onVisualizationTypeChange,
  isRecording,
  onStartRecording,
  onStopRecording
}: AudiogramSettingsSidebarProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const settingsContent = (
    <div className="w-full space-y-4">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Recording Section */}
        <AccordionItem value="recording">
          <AccordionTrigger className="flex gap-2">
            <Video className="h-4 w-4" />
            Recording
          </AccordionTrigger>
          <AccordionContent>
            <Button
              onClick={isRecording ? onStopRecording : onStartRecording}
              variant={isRecording ? "destructive" : "default"}
              className="w-full mt-2"
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Visualization Type Section */}
        <AccordionItem value="visualization">
          <AccordionTrigger className="flex gap-2">
            <Wand2 className="h-4 w-4" />
            Visualization Style
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { type: 'bars', label: 'Bars' },
                { type: 'filledWave', label: 'Filled Wave' },
                { type: 'line', label: 'Line' },
                { type: 'musicolors', label: 'Musicolors' }
              ].map(({ type, label }) => (
                <Button
                  key={type}
                  onClick={() => onVisualizationTypeChange(type as VisualizationType)}
                  variant={visualizationType === type ? "default" : "outline"}
                  size="sm"
                >
                  {label}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visualization Settings Section */}
        <AccordionItem value="settings">
          <AccordionTrigger className="flex gap-2">
            <Settings className="h-4 w-4" />
            Visualization Settings
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
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

            {/* Bars-specific settings */}
            {visualizationType === 'bars' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bar Width</label>
                  <Slider
                    value={[config.barWidth || 2]}
                    onValueChange={([value]) => onConfigChange({ barWidth: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bar Spacing</label>
                  <Slider
                    value={[config.barSpacing || 1]}
                    onValueChange={([value]) => onConfigChange({ barSpacing: value })}
                    min={0}
                    max={5}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Corner Radius</label>
                  <Slider
                    value={[config.cornerRadius || 0]}
                    onValueChange={([value]) => onConfigChange({ cornerRadius: value })}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
              </>
            )}

            {/* Musicolors-specific settings */}
            {visualizationType === 'musicolors' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mode</label>
                  <Select
                    value={config.musicolorsMode || 'circle'}
                    onValueChange={(value) => onConfigChange({ 
                      musicolorsMode: value as 'circle' | 'flower' | 'spiral' 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="circle">Circle</SelectItem>
                      <SelectItem value="flower">Flower</SelectItem>
                      <SelectItem value="spiral">Spiral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Glow Intensity</label>
                  <Slider
                    value={[config.glowIntensity || 20]}
                    onValueChange={([value]) => onConfigChange({ glowIntensity: value })}
                    min={0}
                    max={50}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Rotation Speed</label>
                  <Slider
                    value={[config.rotationSpeed || 1]}
                    onValueChange={([value]) => onConfigChange({ rotationSpeed: value })}
                    min={0}
                    max={5}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Particle Count</label>
                  <Slider
                    value={[config.particleCount || 100]}
                    onValueChange={([value]) => onConfigChange({ particleCount: value })}
                    min={10}
                    max={500}
                    step={10}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Particle Size</label>
                  <Slider
                    value={[config.particleSize || 2]}
                    onValueChange={([value]) => onConfigChange({ particleSize: value })}
                    min={1}
                    max={10}
                    step={0.5}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Particle Speed</label>
                  <Slider
                    value={[config.particleSpeed || 1]}
                    onValueChange={([value]) => onConfigChange({ particleSpeed: value })}
                    min={0}
                    max={5}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Smoothing</label>
                  <Slider
                    value={[config.smoothing || 0.5]}
                    onValueChange={([value]) => onConfigChange({ smoothing: value })}
                    min={0}
                    max={1}
                    step={0.1}
                  />
                </div>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Text Settings Section */}
        <AccordionItem value="text">
          <AccordionTrigger className="flex gap-2">
            <Type className="h-4 w-4" />
            Text Settings
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Title settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Title Size</label>
              <Slider
                value={[config.titleSize || 16]}
                onValueChange={([value]) => onConfigChange({ titleSize: value })}
                min={12}
                max={32}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title Color</label>
              <Input
                type="color"
                value={config.titleColor || '#FFFFFF'}
                onChange={(e) => onConfigChange({ titleColor: e.target.value })}
              />
            </div>

            {/* Transcript settings */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Transcript Size</label>
              <Slider
                value={[config.transcriptSize || 20]}
                onValueChange={([value]) => onConfigChange({ transcriptSize: value })}
                min={12}
                max={32}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transcript Color</label>
              <Input
                type="color"
                value={config.transcriptColor || '#FFFFFF'}
                onChange={(e) => onConfigChange({ transcriptColor: e.target.value })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Background Settings */}
        <AccordionItem value="background">
          <AccordionTrigger className="flex gap-2">
            <ImageIcon className="h-4 w-4" />
            Background
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              <label className="text-sm font-medium">Background Image URL</label>
              <Input
                type="text"
                placeholder="Enter image URL"
                value={config.backgroundImage || ''}
                onChange={(e) => onConfigChange({ backgroundImage: e.target.value })}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed right-4 top-4">
            <Settings className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:max-w-none">
          <SheetHeader>
            <SheetTitle>Audiogram Settings</SheetTitle>
          </SheetHeader>
          {settingsContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="w-[400px] border-l bg-background p-6 overflow-y-auto">
      <h2 className="font-semibold mb-6">Audiogram Settings</h2>
      {settingsContent}
    </aside>
  );
} 