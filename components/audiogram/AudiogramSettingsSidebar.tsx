import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { VisualizerConfig, VisualizationType } from './types';
import { Settings, Video, Wand2, Type, Image as ImageIcon, MessageSquare } from 'lucide-react';
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
                { type: 'Cubes', label: 'Cubes' },
                { type: 'Wave', label: 'Wave' },
                { type: 'Lines', label: 'Lines' },
                { type: 'Square', label: 'Square' }
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
            {visualizationType === 'Bars' && (
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

                {/* Opacity control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Opacity</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.visualizerOpacity ? config.visualizerOpacity * 100 : 100]}
                        onValueChange={([value]) => onConfigChange({ visualizerOpacity: value / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-[120px]"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={Math.round(config.visualizerOpacity ? config.visualizerOpacity * 100 : 100)}
                          onChange={(e) => onConfigChange({ visualizerOpacity: Number(e.target.value) / 100 })}
                          className="w-16"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Text Settings Section */}
        <AccordionItem value="text">
          <AccordionTrigger className="flex gap-2">
            <Type className="h-4 w-4" />
            Text Settings
          </AccordionTrigger>
          <AccordionContent className="space-y-8">
            {/* Title settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <Type className="h-4 w-4" />
                <h4 className="font-medium">Title</h4>
              </div>
              
              {/* Title settings content */}
              <div className="space-y-4 pl-2">
                {/* Size control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Size</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.titleSize || 16]}
                        onValueChange={([value]) => onConfigChange({ titleSize: value })}
                        min={12}
                        max={48}
                        step={1}
                        className="w-[120px]"
                      />
                      <Input
                        type="number"
                        value={config.titleSize || 16}
                        onChange={(e) => onConfigChange({ titleSize: Number(e.target.value) })}
                        className="w-16"
                        min={12}
                        max={48}
                      />
                    </div>
                  </div>
                </div>

                {/* Position control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Position</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.titlePosition ? config.titlePosition * 100 : 20]}
                        onValueChange={([value]) => onConfigChange({ titlePosition: value / 100 })}
                        min={5}
                        max={95}
                        step={1}
                        className="w-[120px]"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={Math.round(config.titlePosition ? config.titlePosition * 100 : 20)}
                          onChange={(e) => onConfigChange({ titlePosition: Number(e.target.value) / 100 })}
                          className="w-16"
                          min={5}
                          max={95}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opacity control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Opacity</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.titleOpacity ? config.titleOpacity * 100 : 80]}
                        onValueChange={([value]) => onConfigChange({ titleOpacity: value / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-[120px]"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={Math.round(config.titleOpacity ? config.titleOpacity * 100 : 80)}
                          onChange={(e) => onConfigChange({ titleOpacity: Number(e.target.value) / 100 })}
                          className="w-16"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    type="color"
                    value={config.titleColor || '#FFFFFF'}
                    onChange={(e) => onConfigChange({ titleColor: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Transcript settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b pb-2">
                <MessageSquare className="h-4 w-4" />
                <h4 className="font-medium">Transcript</h4>
              </div>
              
              {/* Transcript settings content */}
              <div className="space-y-4 pl-2">
                {/* Size control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Size</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.transcriptSize || 16]}
                        onValueChange={([value]) => onConfigChange({ transcriptSize: value })}
                        min={12}
                        max={32}
                        step={1}
                        className="w-[120px]"
                      />
                      <Input
                        type="number"
                        value={config.transcriptSize || 16}
                        onChange={(e) => onConfigChange({ transcriptSize: Number(e.target.value) })}
                        className="w-16"
                        min={12}
                        max={32}
                      />
                    </div>
                  </div>
                </div>

                {/* Position control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Position</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.transcriptPosition ? config.transcriptPosition * 100 : 50]}
                        onValueChange={([value]) => onConfigChange({ transcriptPosition: value / 100 })}
                        min={5}
                        max={95}
                        step={1}
                        className="w-[120px]"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={Math.round(config.transcriptPosition ? config.transcriptPosition * 100 : 50)}
                          onChange={(e) => onConfigChange({ transcriptPosition: Number(e.target.value) / 100 })}
                          className="w-16"
                          min={5}
                          max={95}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Opacity control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Opacity</label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.transcriptOpacity ? config.transcriptOpacity * 100 : 100]}
                        onValueChange={([value]) => onConfigChange({ transcriptOpacity: value / 100 })}
                        min={0}
                        max={100}
                        step={1}
                        className="w-[120px]"
                      />
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={Math.round(config.transcriptOpacity ? config.transcriptOpacity * 100 : 100)}
                          onChange={(e) => onConfigChange({ transcriptOpacity: Number(e.target.value) / 100 })}
                          className="w-16"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color control */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    type="color"
                    value={config.transcriptColor || '#FFFFFF'}
                    onChange={(e) => onConfigChange({ transcriptColor: e.target.value })}
                  />
                </div>
              </div>
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
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute right-4 top-4 z-10"
            style={{ 
              position: 'absolute',
              top: '1rem',
              right: '1rem'
            }}
          >
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