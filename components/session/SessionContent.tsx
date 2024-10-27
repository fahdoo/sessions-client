'use client';

import { useState } from 'react';
import { useAuth } from "@clerk/nextjs";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import WaveformPlayer from '@/components/session/WaveformPlayer';
import { ClientSessionControls } from '@/components/session/ClientSessionControls';
import { Session } from '@/lib/types';
import { Globe, Lock } from 'lucide-react';
import Link from 'next/link';

interface SessionContentProps {
  session: Session;
  signedAudioUrl: string | null;
}

export function SessionContent({ session, signedAudioUrl }: SessionContentProps) {
  const { userId } = useAuth();
  const isOwner = userId === session.userId;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="relative h-1/3 bg-slate-200 dark:bg-slate-800 rounded-b-3xl shadow-lg overflow-hidden">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={session.user.avatar} alt={`${session.user.firstName} ${session.user.lastName}`} className="object-cover" />
          <AvatarFallback className="text-6xl">{session.user.firstName[0]}{session.user.lastName[0]}</AvatarFallback>
        </Avatar>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <ClientSessionControls sessionId={session.id} isOwner={isOwner} />
          <div className="z-10 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{session.title}</h1>
              <Link href={`/profile/${session.user.username}`} className="text-xs text-slate-200 drop-shadow-md hover:underline">
                {session.user.firstName} {session.user.lastName} • {new Date(session.createdAt).toLocaleDateString()}
              </Link>
            </div>
            <Badge 
              variant="secondary" 
              className="flex items-center mb-1"
            >
              {session.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {session.isPublic ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="py-6 px-4">
        {signedAudioUrl && <WaveformPlayer audioUrl={signedAudioUrl} />}
      </div>
      <div className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-700">{session.summary}</p>
      </div>
    </div>
  );
}
