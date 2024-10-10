import React, { useState, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';

interface TranscriptionDrawerProps {
  onTranscriptUpdate: (transcript: string) => void;
}

export function TranscriptionDrawer({ onTranscriptUpdate }: TranscriptionDrawerProps) {
  const [transcriptions, setTranscriptions] = useState<Record<string, any>>({});
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (
      segments: any[],
      participant: any,
      publication: any
    ) => {
      setTranscriptions((prev) => {
        const newTranscriptions = { ...prev };
        for (const segment of segments) {
          if (segment.id && segment.text) {
            newTranscriptions[segment.id] = segment;
          }
        }
        return newTranscriptions;
      });
    };

    room.on('transcriptionReceived', handleTranscriptionReceived);

    return () => {
      room.off('transcriptionReceived', handleTranscriptionReceived);
    };
  }, [room]);

  useEffect(() => {
    const fullTranscript = Object.values(transcriptions)
      .sort((a: any, b: any) => (a.firstReceivedTime || 0) - (b.firstReceivedTime || 0))
      .map((segment: any) => segment.text)
      .join(' ');
    onTranscriptUpdate(fullTranscript);
  }, [transcriptions, onTranscriptUpdate]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <h3 className="font-semibold mb-2">Transcription</h3>
          <div className="text-sm">
            {Object.values(transcriptions)
              .sort((a: any, b: any) => (a.firstReceivedTime || 0) - (b.firstReceivedTime || 0))
              .map((segment: any) => (
                <span key={segment.id} className={segment.final ? 'font-bold' : 'italic'}>
                  {segment.text}{' '}
                </span>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}