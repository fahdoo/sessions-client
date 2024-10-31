'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ClientSessionControls } from '@/components/session/view/ClientSessionControls';
import { formatDuration } from '@/lib/utils';
import { Session } from '@/lib/types';

interface ClientSessionViewProps {
  session: Session;
  isOwner: boolean;
}

export function ClientSessionView({ session, isOwner }: ClientSessionViewProps) {
  const [title, setTitle] = useState(session.title);
  const userName = `${session.user?.firstName} ${session.user?.lastName}`.trim();

  return (
    <div className="space-y-4">
      {/* Hero section with background image */}
      <div className="relative aspect-square sm:aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
        {/* Background image or gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-slate-950/30" />

        {/* Controls overlay */}
        <div className="absolute top-4 left-4 right-4 z-30">
          <ClientSessionControls 
            sessionId={session.id} 
            isOwner={isOwner}
            currentTitle={title}
            onTitleGenerated={setTitle}
          />
        </div>

        {/* Centered content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-2xl sm:text-4xl font-bold text-white max-w-2xl">
            {title}
          </h1>
        </div>

        {/* Bottom metadata */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <div className="flex flex-col items-center gap-2">
            {/* Avatar and name row */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={session.user?.avatar || ''} 
                  alt={userName}
                />
                <AvatarFallback>
                  {userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{userName}</span>
            </div>

            {/* Metadata row */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <span>{new Date(session.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{formatDuration(session.duration || 360)}</span>
              {!session.isPublic && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>Private</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary section */}
      {session.summary && (
        <div className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {session.summary}
          </div>
        </div>
      )}
    </div>
  );
}
