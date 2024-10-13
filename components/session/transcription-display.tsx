import React from 'react';
import { Badge } from "@/components/ui/badge";
import { aiAgentNameMapping } from "@/lib/utils";

interface TranscriptSegment {
  id: string;
  participantId: string;
  text: string | null | undefined;
  startTime: number;
  endTime: number;
  language: string;
  isFinal: boolean;
}

interface TranscriptionDisplayProps {
  transcript: TranscriptSegment[] | null;
  userName: string;
}

export function TranscriptionDisplay({ transcript, userName }: TranscriptionDisplayProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Transcript</h2>
      <div className="space-y-2">
        {transcript && transcript.length > 0 ? (
          transcript
            .sort((a, b) => a.startTime - b.startTime)
            .filter(segment => segment.text && segment.text.trim() !== '')
            .map((segment) => (
              <div key={segment.id} className={segment.isFinal ? 'font-normal' : 'italic text-gray-500'}>
                <span className="font-semibold">
                  {segment.participantId.startsWith('ai-') ? (
                    <>
                      {aiAgentNameMapping[segment.participantId] || 'AI'}
                      <Badge variant="secondary" className="ml-1 text-xs">AI</Badge>
                    </>
                  ) : (
                    userName
                  )}
                  :{' '}
                </span>
                {segment.text}
              </div>
            ))
        ) : (
          <div>No transcript available</div>
        )}
      </div>
    </div>
  );
}
