"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from '@/components/session/audio-player';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionCardProps {
  session: Session;
  showUser?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showSummary?: boolean;
  isOwner?: boolean;
  showAudioPlayer?: boolean;
}

export default function SessionCard({ 
  session, 
  showUser = true, 
  showDuration = false, 
  showSummary = true,
  isOwner = false,
  showAudioPlayer = false,
}: SessionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToggle, setShowToggle] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (summaryRef.current) {
      setShowToggle(summaryRef.current.scrollHeight > summaryRef.current.clientHeight);
    }
  }, [session.summary]);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative p-4">
      <CardContent className="p-0">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-3 flex-grow overflow-hidden">
          {showUser && session.user && (
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage 
                src={session.user.avatar || '/default-avatar.png'} 
                alt={`${session.user.firstName} ${session.user.lastName}`} 
              />
              <AvatarFallback>
                {session.user.firstName?.[0]}
                {session.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex flex-col min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/sessions/${session.id}`} className="block">
                    <h3 className="text-lg leading-tight truncate">
                      {session.title}
                    </h3>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{session.title}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            {showUser && session.user && (
              <Link href={`/profile/${session.user.username}`} className="text-sm text-slate-400 hover:underline truncate">
                {session.user.firstName} {session.user.lastName}
              </Link>
            )}
            {showDuration && session.duration && (
              <span className="text-sm text-slate-400">{formatDuration(session.duration)}</span>
            )}
          </div>
        </div>
        {isOwner && (
          <div className="flex-shrink-0 ml-2">
            <Badge 
              variant={session.isPublic ? "secondary" : "outline"}
              className="z-10"
            >
              {session.isPublic ? (
                <>
                  <Globe className="mr-1 h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="mr-1 h-3 w-3" />
                  Private
                </>
              )}
            </Badge>
          </div>
        )}
      </div>
        {showAudioPlayer && (
          <div className="w-full mt-4" onClick={(e) => e.preventDefault()}>
            {session.audioUrl ? (
              <AudioPlayer sessionId={session.id} />
            ) : (
              <div>No audio available</div>
            )}
          </div>
        )}
        {showSummary && session.summary && (
          <div className="relative mt-4">
            <p 
              ref={summaryRef}
              className={`text-sm text-slate-400 ${isExpanded ? '' : 'line-clamp-2'} overflow-hidden pr-6`}
            >
              {session.summary}
            </p>
            {showToggle && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(!isExpanded)}
                className="absolute bottom-0 right-0 p-1 h-auto text-xs text-slate-400 hover:text-slate-200"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span className="sr-only">{isExpanded ? 'Read less' : 'Read more'}</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
