"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from '@/lib/types';
import Link from 'next/link';
import { formatDuration } from '@/lib/utils/format';
import { MiniAudioPlayer } from '@/components/session/audio/MiniAudioPlayer';
import { Shield, Globe } from 'lucide-react';
import { cn } from "@/lib/utils/client";

interface SessionCardProps {
  session: Session;
  showUser?: boolean;
  showDuration?: boolean;
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
  showAudioPlayer = true,
}: SessionCardProps) {
  return (
    <div className="hover:shadow-lg transition-shadow duration-300 relative bg-card hover:bg-slate-700 overflow-hidden rounded-lg">
      <div className="flex items-center p-3">
        {showAudioPlayer && (
          <MiniAudioPlayer 
            sessionId={session.id}
            sessionTitle={session.title}
            userAvatarUrl={session.user?.avatar}
            userName={session.user ? `${session.user.firstName} ${session.user.lastName}`.trim() : undefined}
          />
        )}

        <div className="flex-grow ml-3">
          <div className="flex flex-col">
            <div className="flex justify-between items-start">
              <Link href={`/sessions/${session.id}`}>
                <h3 className="text-base md:text-lg md:leading-tight leading-tight line-clamp-2 text-white">
                  {session.title}
                </h3>
              </Link>
              {showDuration && session.duration && (
                <span className="text-sm text-slate-400 ml-2 flex-shrink-0">
                  {formatDuration(session.duration)}
                </span>
              )}
            </div>
            
            {/* Visibility indicator */}
            <div className="mt-1">
              {isOwner && (
                <div className={cn(
                  "inline-flex items-center gap-1 py-0.5 rounded-full text-xs",
                  session.isPublic 
                    ? "bg-emerald-500/10 text-emerald-400 px-1.5"
                    : "text-slate-400"
                )}>
                  {session.isPublic ? (
                    <>
                      <Globe className="h-3 w-3" />
                      <span>Public</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-3 w-3" />
                      <span>Private</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {showUser && session.user && (
              <div className="flex items-center space-x-2 text-slate-400 mt-1 leading-none">
                <Link href={`/profile/${session.user.username}`} className="flex items-center">
                  <Avatar className="w-4 h-4 flex-shrink-0 hover:opacity-80 transition-opacity">
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
                <Link href={`/profile/${session.user.username}`}>
                  <span className="text-sm font-semibold hover:underline leading-none">
                    {session.user.firstName} {session.user.lastName}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSummary && session.summary && (
        <div className="bg-slate-900/30 p-3 pt-4 text-sm text-slate-400">
          {session.summary}
        </div>
      )}
    </div>
  );
}
