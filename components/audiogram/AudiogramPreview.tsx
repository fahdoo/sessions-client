import { PlayerRef } from '@remotion/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import { PlayerOnly } from './PlayerOnly';
import { DualRangeSlider } from '@/components/ui/dual-range-slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoFormat, VIDEO_FORMATS } from '@/remotion/templates/audiogram-basic/types';
import { HelpCircle } from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';
import { Loader2 } from 'lucide-react';

interface AudiogramPreviewProps {
  session: {
    audioUrl: string;
    title: string;
    user: {
      avatar: string;
      username: string;
    };
    transcriptData?: string;
    duration: number;
  };
  onRender?: (config: RenderConfig) => void;
  isRendering?: boolean;
}

export interface RenderConfig {
  title: string;
  startTime: number;
  endTime: number;
  format: VideoFormat;
}

const formatTimeLabel = (value: number): string => {
  return `${Math.floor(value / 60)}:${(value % 60).toString().padStart(2, '0')}`;
};

export const AudiogramPreview: React.FC<AudiogramPreviewProps> = ({
  session,
  onRender,
  isRendering
}) => {
  console.log('AudiogramPreview received session:', {
    hasTranscriptData: !!session.transcriptData,
    transcriptDataLength: session.transcriptData?.length,
    audioUrl: session.audioUrl?.substring(0, 50) + '...'
  });

  const playerRef = useRef<PlayerRef>(null);
  const [config, setConfig] = useState<RenderConfig>({
    title: session.title,
    startTime: 0,
    endTime: Math.min(30, session.duration || 30),
    format: 'square'
  });

  const handleFormatChange = (format: VideoFormat) => {
    setConfig(prev => ({ ...prev, format }));
  };

  const handleTitleChange = (title: string) => {
    setConfig(prev => ({ ...prev, title }));
  };

  const handleTimeRangeChange = (values: [number, number]) => {
    setConfig(prev => ({
      ...prev,
      startTime: values[0],
      endTime: values[1]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="max-w-3xl mx-auto">
        <PlayerOnly
          playerRef={playerRef}
          session={session}
          config={config}
          format={config.format}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={config.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter video title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Format</label>
          <Select
            value={config.format}
            onValueChange={(value: VideoFormat) => handleFormatChange(value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VIDEO_FORMATS).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center">
                    <span>{value.label}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({value.width}x{value.height})
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Best for: {value.platforms}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <DualRangeSlider
            min={0}
            max={session.duration || 30}
            value={[config.startTime, config.endTime]}
            onValueChange={handleTimeRangeChange}
            step={1}
          />
          <div className="mt-1 text-sm text-muted-foreground">
            {formatTimeLabel(config.startTime)} - {formatTimeLabel(config.endTime)}
          </div>
        </div>

        {onRender && (
          <Button 
            className="w-full"
            onClick={() => onRender(config)}
            disabled={isRendering}
          >
            {isRendering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Video...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}; 