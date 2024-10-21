import React from 'react';
import { aiAgentNameMapping, isAIAgent } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BotMessageSquare } from 'lucide-react'; // Import BotMessageSquare instead of MessageCircle

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
      <h2 className="text-2xl mb-4 font-semibold">Transcript</h2>
      <div className="space-y-4 bg-slate-300 p-4 rounded-lg">
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
                      <div className="w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center flex-shrink-0">
                        <BotMessageSquare size={20} className="text-slate-100" />
                      </div>
                    ) : (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div 
                      className={`p-2 rounded-lg ${
                        isAI ? 'bg-slate-300 text-slate-500 ml-2' : 'bg-slate-100 text-slate-800 mr-2'
                      } ${segment.isFinal ? '' : 'italic opacity-70'}`}
                    >
                      <span className="text-xs text-slate-500 mb-1 block font-bold">
                        {isAI ? (
                          <>
                            {aiAgentNameMapping[segment.participantId] || 'Muse'}
                          </>
                        ) : (
                          userName
                        )}
                        {' '}
                        <span className="font-normal">
                          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                        </span>
                      </span>
                      <p className="text-sm break-words">{segment.text}</p>
                    </div>
                  </div>
                </div>
              );
            })
        ) : (
          <div>No transcript available</div>
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
