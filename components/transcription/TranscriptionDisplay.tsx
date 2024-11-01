import React from 'react';
import { aiAgentNameMapping, isAIAgent } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BotMessageSquare } from 'lucide-react';

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
  userAvatar?: string;
}

export function TranscriptionDisplay({ transcript, userName, userAvatar }: TranscriptionDisplayProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="space-y-4 bg-stone-800 p-4 rounded-lg h-[400px] overflow-y-auto">
        {transcript && transcript.length > 0 ? (
          transcript
            .sort((a, b) => a.startTime - b.startTime)
            .filter(segment => segment.text && segment.text.trim() !== '')
            .map((segment) => {
              const isAI = isAIAgent(segment.participantId);
              return (
                <div 
                  key={segment.id} 
                  className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`flex ${isAI ? 'flex-row' : 'flex-row-reverse'} items-start max-w-[70%]`}>
                    {isAI ? (
                      <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                        <BotMessageSquare size={20} className="text-stone-300" />
                      </div>
                    ) : (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`p-2 rounded-lg ${
                        isAI ? 'bg-stone-700 text-stone-300 ml-2' : 'bg-stone-600 text-stone-200 mr-2'
                      } ${segment.isFinal ? '' : 'italic opacity-70'}`}
                    >
                      <span className="text-xs text-stone-400 mb-1 block font-bold">
                        {isAI ? (
                          <>
                            {aiAgentNameMapping[segment.participantId] || 'Muse'}
                          </>
                        ) : (
                          userName
                        )}
                      </span>
                      <p className="text-sm break-words">{segment.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-stone-400">No transcript available</div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
