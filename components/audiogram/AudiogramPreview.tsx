import { PlayerRef } from '@remotion/player';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef } from 'react';
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

interface AudiogramPreviewProps {
  session: {
    audioUrl: string;
    title: string;
    user: {
      avatar: string;
      username: string;
    };
    transcriptUrl: string;
    duration: number;
  };
  onRender?: (config: RenderConfig) => void;
}

export interface RenderConfig {
  title: string;
  startTime: number;
  endTime: number;
  format: VideoFormat;
}

export const AudiogramPreview: React.FC<AudiogramPreviewProps> = ({ 
  session,
  onRender 
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [title, setTitle] = useState(session.title);
  const [timeRange, setTimeRange] = useState([0, session.duration || 30]);
  const [format, setFormat] = useState<VideoFormat>('square');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRender = () => {
    onRender?.({
      title,
      startTime: timeRange[0],
      endTime: timeRange[1],
      format
    });
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Format</label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Choose the best format for your target platform</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select
            value={format}
            onValueChange={(value) => setFormat(value as VideoFormat)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(VIDEO_FORMATS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div>
                    <div>{config.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {config.platforms}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Time Range</label>
          <div className="mt-6 px-2">
            <DualRangeSlider
              min={0}
              max={session.duration || 30}
              step={1}
              value={timeRange}
              onValueChange={setTimeRange}
              formatValue={formatTime}
              className="mt-1"
            />
            <div className="flex justify-between text-sm mt-2 text-muted-foreground">
              <span>Start: {formatTime(timeRange[0])}</span>
              <span>Duration: {formatTime(timeRange[1] - timeRange[0])}</span>
              <span>End: {formatTime(timeRange[1])}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[320px] mx-auto">
        <PlayerOnly 
          playerRef={playerRef}
          session={session}
          config={{ 
            title,
            startTime: timeRange[0],
            endTime: timeRange[1]
          }}
          format={format}
        />
      </div>

      <div className="flex justify-end gap-2 sticky bottom-0 bg-background pt-4">
        <Button 
          onClick={handleRender}
        >
          Generate Video
        </Button>
      </div>
    </div>
  );
}; 