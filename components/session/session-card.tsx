"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from '@/components/session/audio-player';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils';

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
  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="hover:shadow-lg transition-shadow duration-300 relative bg-card hover:bg-slate-700 overflow-hidden">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="flex items-start space-x-3 flex-grow overflow-hidden">
              {showUser && session.user && (
                <Link 
                  href={`/profile/${session.user.username}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0 hover:opacity-80 transition-opacity">
                    <AvatarImage 
                      src={session.user.avatar || '/default-avatar.png'} 
                      alt={`${session.user.firstName} ${session.user.lastName}`} 
                    />
                    <AvatarFallback>
                      {session.user.firstName?.[0]}
                      {session.user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}
              <div className="flex flex-col min-w-0">
                <h3 className="text-base md:text-lg md:leading-tight leading-tight line-clamp-2 text-white">
                  {session.title}
                </h3>
                {showUser && session.user && (
                  <Link 
                    href={`/profile/${session.user.username}`} 
                    className="text-sm font-semibold text-slate-400 hover:underline inline-block truncate mt-2"
                    onClick={(e) => e.stopPropagation()}  // Prevent triggering parent link
                  >
                    {session.user.firstName} {session.user.lastName}
                  </Link>
                )}
                {showDuration && session.duration && (
                  <span className="text-xs text-slate-400">
                    {formatDuration(session.duration)}
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="flex-shrink-0 ml-2 mt-2 md:mt-0">
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
        </CardContent>
        {showSummary && session.summary && (
          <div className="bg-slate-900/20 p-3 pt-4 text-sm text-slate-400">
            {session.summary}
          </div>
        )}
      </Card>
    </Link>
  );
}
