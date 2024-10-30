import { auth } from "@clerk/nextjs/server";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClientSessionControls } from '@/components/session/ClientSessionControls';
import { Globe, Lock } from 'lucide-react';
import { AudioPlayer } from '@/components/session/audio-player';
import { formatDuration } from '@/lib/utils';
import { Session } from '@/lib/types';
import { getBaseUrl } from '@/lib/server-utils';
import { TitleSection } from '@/components/session/title-section';

async function getSession(id: string): Promise<Session> {
  const { getToken } = auth();
  const baseUrl = getBaseUrl();
  
  try {
    const token = await getToken();
    console.log('Fetching session:', id, 'from:', `${baseUrl}/api/sessions/${id}`);
    const response = await fetch(`${baseUrl}/api/sessions/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Session fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(
        errorData.error || 
        `Failed to fetch session: ${response.status} ${response.statusText}`
      );
    }
    
    const data = await response.json();
    return data as Session;
  } catch (error) {
    console.error('Error in getSession:', error);
    throw error;
  }
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const session = await getSession(params.id);

  if (!session.isPublic && session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const isOwner = userId === session.userId;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative bg-slate-200 dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mt-4 sm:mt-4">
          {/* Stack vertically and center - switch at sm breakpoint */}
          <div className="sm:flex sm:flex-col sm:items-center sm:p-6 sm:pt-16">
            {/* Avatar container */}
            <div className="relative w-full sm:w-40 sm:h-40">
              <Avatar className="w-full h-full rounded-none sm:rounded-xl">
                <AvatarImage 
                  src={session.user.avatar} 
                  alt={`${session.user.firstName} ${session.user.lastName}`} 
                  className="object-cover"
                />
                <AvatarFallback className="text-6xl">
                  {session.user.firstName[0]}{session.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Controls - positioned relative to avatar on mobile, relative to card on wider screens */}
            <div className="absolute top-4 left-4 right-4 z-30 sm:fixed-to-parent">
              <ClientSessionControls sessionId={session.id} isOwner={isOwner} />
            </div>
          
            {/* Gradient overlay only shows on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent sm:hidden" />
          
            {/* Content container */}
            <div className="absolute inset-0 sm:static flex flex-col justify-end sm:justify-start p-4 sm:p-0 sm:mt-6 w-full">
              <div className="z-10 flex flex-col items-center gap-2">
                <TitleSection
                  title={session.title}
                  sessionId={session.id}
                  isOwner={isOwner}
                />
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-200 sm:text-slate-600 sm:dark:text-slate-400">
                  <span>{session.user.firstName} {session.user.lastName}</span>
                  {session.duration && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(session.duration)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="flex items-center flex-shrink-0"
                >
                  {session.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {session.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="my-4">
          <AudioPlayer 
            sessionId={params.id}
            sessionTitle={session.title}
            userAvatarUrl={session.user?.avatar}
            userName={`${session.user?.firstName} ${session.user?.lastName}`.trim()}
          />
        </div>
        <div className="my-4">
          <p className="text-base md:text-lg text-slate-600 dark:text-slate-500">
            {session.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
