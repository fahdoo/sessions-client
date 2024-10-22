import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import { TranscriptionSegment } from 'livekit-client';

interface TranscriptionDrawerProps {
  onTranscriptUpdate: (transcript: TranscriptionSegment[]) => void;
  sessionId: string;
  currentTitle: string;
  transcript: Array<{
    id: string;
    participantId: string;
    text: string;
    startTime: number;
    endTime: number;
    language: string;
    isFinal: boolean;
  }>;
}

export function TranscriptionDrawer({ currentTitle, transcript }: TranscriptionDrawerProps) {
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toISOString().substr(11, 8); // This will return the time in HH:MM:SS format
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <h3 className="font-semibold mb-2">Current Title: {currentTitle}</h3>
          <h4 className="font-semibold mb-2">Transcription</h4>
          <div className="text-sm">
            {transcript
              .sort((a, b) => a.startTime - b.startTime)
              .map((segment) => (
                <div key={segment.id} className={segment.isFinal ? 'font-bold' : 'italic'}>
                  {segment.text}
                  <span className="text-xs text-gray-500 ml-2">
                    ({formatTime(segment.startTime)} - {formatTime(segment.endTime)})
                  </span>
                </div>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
