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
  showDuration = true, 
  showSummary = false
}: SessionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 relative">
      <Badge 
        variant={session.isPublic ? "secondary" : "outline"}
        className="absolute top-3 left-3 z-10"
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
      {showDuration && session.duration && (
        <span className="absolute top-3 right-3 text-xs text-slate-400">
          {formatDuration(session.duration)}
        </span>
      )}
      <CardHeader className="flex flex-row items-start space-x-4 pt-10 px-3 pb-2">
        {showUser && (
          <Avatar className="w-10 h-10 mt-1">
            <AvatarImage 
              src={session.user.avatar || '/default-avatar.png'} 
              alt={`${session.user.firstName} ${session.user.lastName}`} 
            />
            <AvatarFallback>
              {session.user.firstName.charAt(0)}
              {session.user.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        <div className="flex flex-col">
          <Link href={`/sessions/${session.id}`}>
            <CardTitle className="text-lg hover:underline cursor-pointer">
              {session.title}
            </CardTitle>
          </Link>
          {showUser && (
            <p className="text-xs text-slate-600">
              {session.user.firstName} {session.user.lastName}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-3">
        <div className="w-full" onClick={(e) => e.preventDefault()}>
          {session.audioUrl && <AudioPlayer sessionId={session.id} />}
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