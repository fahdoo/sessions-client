import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Settings, Palette, Type, Wand2, Video } from 'lucide-react';

interface AudiogramToolbarProps {
  onOpenVisualSettings: () => void;
  onOpenTextSettings: () => void;
  onOpenEffectSettings: () => void;
  onOpenColorSettings: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export function AudiogramToolbar(props: AudiogramToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={props.onOpenVisualSettings}>
            Visualization
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onOpenTextSettings}>
            Text & Title
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onOpenEffectSettings}>
            Effects
          </DropdownMenuItem>
          <DropdownMenuItem onClick={props.onOpenColorSettings}>
            Colors
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Recording button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={props.isRecording ? props.onStopRecording : props.onStartRecording}
        className={props.isRecording ? 'text-red-500' : ''}
      >
        <Video className="h-4 w-4 mr-2" />
        {props.isRecording ? 'Stop Recording' : 'Record'}
      </Button>
    </div>
  );
} 