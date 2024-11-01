import React from 'react';
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { MessageSquare, BotMessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isAIAgent, aiAgentNameMapping } from "@/lib/utils";

interface TranscriptionDrawerProps {
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
  userName: string;
  userAvatar?: string;
}

export function TranscriptionDrawer({ currentTitle, transcript, userName, userAvatar }: TranscriptionDrawerProps) {
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toISOString().substr(11, 8); // This will return the time in HH:MM:SS format
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button 
          variant="secondary"
          size="sm"
          className="rounded-full"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          <div className="space-y-4">
            {transcript
              .sort((a, b) => a.startTime - b.startTime)
              .map((segment) => {
                const isAI = isAIAgent(segment.participantId);
                return (
                  <div key={segment.id} className="flex items-start space-x-2">
                    {isAI ? (
                      <div className="w-8 h-8 rounded-full bg-stone-700 flex items-center justify-center flex-shrink-0">
                        <BotMessageSquare size={20} className="text-stone-300" />
                      </div>
                    ) : (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName[0]}</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {isAI ? aiAgentNameMapping[segment.participantId] || 'AI' : userName}
                      </p>
                      <p className={`text-sm ${segment.isFinal ? 'font-normal' : 'italic'}`}>
                        {segment.text}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
