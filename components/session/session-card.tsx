import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Lock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Session } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { AudioPlayer } from '@/components/ui/audio-player';
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
        className="absolute top-2 right-2 z-10"
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
      <CardHeader className="flex flex-row items-center space-x-4">
        {showUser && (
          <Avatar className="w-10 h-10">
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
        <Link href={`/sessions/${session.id}`}>
          <CardTitle className="text-lg flex-grow hover:underline cursor-pointer">
            {session.title}
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent>
        {showUser && (
          <p className="text-sm text-gray-500">
            By {session.user.firstName} {session.user.lastName}
          </p>
        )}
        {showDuration && session.duration && (
          <p className="text-sm text-gray-500">
            Duration: {formatDuration(session.duration)}
          </p>
        )}
        <div className="mt-4 w-full" onClick={(e) => e.preventDefault()}>
          <AudioPlayer audioUrl={session.audioUrl} />
        </div>
        {showSummary && session.summary && (
          <p className="text-sm text-gray-700 mt-4">{session.summary}</p>
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