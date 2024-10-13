import React, { useState, useEffect } from 'react';
import { useRoomContext } from '@livekit/components-react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import { TranscriptionSegment, Participant } from 'livekit-client';

interface TranscriptionDrawerProps {
  onTranscriptUpdate: (transcript: TranscriptionSegment[], participant?: Participant) => void;
}

export function TranscriptionDrawer({ onTranscriptUpdate }: TranscriptionDrawerProps) {
  const [transcriptions, setTranscriptions] = useState<Record<string, TranscriptionSegment>>({});
  const room = useRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleTranscriptionReceived = (
      segments: TranscriptionSegment[],
      participant?: Participant,
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
      onTranscriptUpdate(segments, participant);
    };

    room.on('transcriptionReceived', handleTranscriptionReceived);

    return () => {
      room.off('transcriptionReceived', handleTranscriptionReceived);
    };
  }, [room, onTranscriptUpdate]);

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
              .sort((a, b) => a.startTime - b.startTime)
              .map((segment) => (
                <div key={segment.id} className={segment.final ? 'font-bold' : 'italic'}>
                  {segment.text}
                  <span className="text-xs text-gray-500 ml-2">
                    ({new Date(segment.startTime).toISOString().substr(11, 8)} - {new Date(segment.endTime).toISOString().substr(11, 8)})
                  </span>
                </div>
              ))}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
