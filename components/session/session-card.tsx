"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from '@/components/session/audio-player';
import Link from 'next/link';

interface SessionCardProps {
  session: Session;
  showUser?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showSummary?: boolean;
  isOwner?: boolean;
  showAudioPlayer?: boolean;
  layout?: 'grid' | 'list';
}

export default function SessionCard({ 
  session, 
  showUser = true, 
  showDuration = false, 
  showSummary = true,
  isOwner = false,
  showAudioPlayer = false,
  layout = 'list'
}: SessionCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 relative ${layout === 'grid' ? 'p-2' : 'p-4'}`}>
      <CardContent className="p-0">
        <div className={`flex ${layout === 'grid' ? 'flex-col' : 'justify-between items-start'}`}>
          <div className={`flex items-start ${layout === 'grid' ? 'flex-col' : 'space-x-3'} flex-grow overflow-hidden`}>
            {showUser && session.user && layout === 'list' && (
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
              <Link href={`/sessions/${session.id}`} className="block">
                <h3 className={`font-semibold leading-tight truncate ${layout === 'grid' ? 'text-sm' : 'text-lg'}`}>
                  {session.title}
                </h3>
              </Link>
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
          {isOwner && layout === 'list' && (
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
        {showAudioPlayer && layout === 'list' && (
          <div className="w-full mt-4" onClick={(e) => e.preventDefault()}>
            {session.audioUrl ? (
              <AudioPlayer sessionId={session.id} />
            ) : (
              <div>No audio available</div>
            )}
          </div>
        )}
        {showSummary && session.summary && layout === 'list' && (
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">
            {session.summary}
          </p>
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
