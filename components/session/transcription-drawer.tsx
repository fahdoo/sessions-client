import React, { useState, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import { TranscriptionSegment, Participant } from 'livekit-client';

interface TranscriptionDrawerProps {
  onTranscriptUpdate: (transcript: string) => void;
}

export function TranscriptionDrawer({ onTranscriptUpdate }: TranscriptionDrawerProps) {
  const [transcriptions, setTranscriptions] = useState<Record<string, unknown>>({});
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (
      segments: TranscriptionSegment[],
      participant?: Participant,
      // publication?: TrackPublication
    ) => {
      console.log('Transcription segments', segments);
      console.log('Participant', participant);
      setTranscriptions((prev) => {
        const newTranscriptions = { ...prev };
        for (const segment of segments) {
          newTranscriptions[segment.id] = segment;
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
      .sort((a, b) => {
        const aTime = (a as TranscriptionSegment).firstReceivedTime ?? 0;
        const bTime = (b as TranscriptionSegment).firstReceivedTime ?? 0;
        return aTime - bTime;
      })
      .map((segment: unknown) => (typeof segment === 'object' && segment !== null && 'text' in segment ? segment.text as string : ''))
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
            {(Object.values(transcriptions) as TranscriptionSegment[])
              .sort((a, b) => (a.firstReceivedTime ?? 0) - (b.firstReceivedTime ?? 0))
              .map((segment) => (
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