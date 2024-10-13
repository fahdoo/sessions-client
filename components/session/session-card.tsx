"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}

export default function SessionCard({ 
  session, 
  showUser = true, 
  showDuration = false, 
  showSummary = false
}: SessionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative p-4">
      <div className="absolute top-4 right-4">
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
      <div className="flex items-start space-x-3 mb-4">
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
        <div className="flex flex-col overflow-hidden">
          <Link href={`/sessions/${session.id}`} className="block">
            <CardTitle className="text-lg hover:underline cursor-pointer leading-tight truncate">
              {session.title}
            </CardTitle>
          </Link>
          {showUser && session.user && (
            <Link href={`/profile/${session.user.username}`} className="text-sm text-slate-400 hover:underline">
              {session.user.firstName} {session.user.lastName}
            </Link>
          )}
        </div>
      </div>
      <CardContent className="p-2 pt-2 px-3">
        <div className="w-full" onClick={(e) => e.preventDefault()}>
          {session.audioUrl ? (
            <AudioPlayer sessionId={session.id} />
          ) : (
            <div>No audio available</div>
          )}
        </div>
        {showSummary && session.summary && (
          <p className="text-sm text-slate-400 mt-4">{session.summary}</p>
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
