'use client';

import { useState, useEffect, useRef } from 'react';
import { Session } from '@/lib/types';
import { ClientSessionControls } from '@/components/session/view/ClientSessionControls';
import { Lock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { formatDuration } from '@/lib/utils/format';
import Link from 'next/link';
import { AudioPlayer } from '@/components/session/audio/AudioPlayer';
import { fetchAudioUrl } from '@/lib/utils/audio';

interface ClientSessionViewProps {
  session: Session;
  isOwner: boolean;
}

export function ClientSessionView({ session, isOwner }: ClientSessionViewProps) {
  const [title, setTitle] = useState(session.title);
  const userName = `${session.user?.firstName} ${session.user?.lastName}`.trim();
  const [updatedSession, setUpdatedSession] = useState<Session>(session);
  const [signedAudioUrl, setSignedAudioUrl] = useState<string>();
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const fetchingRef = useRef(false);
  const initialFetchDoneRef = useRef(false);
  const fetchAttemptRef = useRef(0);
  const mountedRef = useRef(false);

  // Single effect to handle audio URL fetching
  useEffect(() => {
    // Skip first render in development strict mode
    if (process.env.NODE_ENV === 'development' && !mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    let refreshTimeout: NodeJS.Timeout;

    const getAudioUrl = async () => {
      const attemptNumber = ++fetchAttemptRef.current;
      
      if (!updatedSession.audioUrl || isLoadingAudio || fetchingRef.current || initialFetchDoneRef.current) {
        console.log('Skipping audio URL fetch:', {
          attemptNumber,
          hasAudioUrl: !!updatedSession.audioUrl,
          isLoadingAudio,
          isFetching: fetchingRef.current,
          initialFetchDone: initialFetchDoneRef.current,
          sessionId: updatedSession.id,
          mounted: mountedRef.current
        });
        return;
      }

      console.log('Starting audio URL fetch:', {
        attemptNumber,
        sessionId: updatedSession.id
      });
      
      fetchingRef.current = true;
      setIsLoadingAudio(true);
      
      try {
        const url = await fetchAudioUrl(updatedSession.id);
        
        if (isMounted) {
          console.log('Audio URL fetch completed:', { 
            attemptNumber,
            sessionId: updatedSession.id,
            url 
          });
          setSignedAudioUrl(url);
          initialFetchDoneRef.current = true;
          refreshTimeout = setTimeout(() => {
            initialFetchDoneRef.current = false; // Reset for refresh
            getAudioUrl();
          }, 25 * 60 * 1000);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Error fetching audio URL:', {
            attemptNumber,
            error,
            sessionId: updatedSession.id
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAudio(false);
          fetchingRef.current = false;
        }
      }
    };

    getAudioUrl();

    return () => {
      console.log('Cleaning up audio URL fetch effect:', {
        sessionId: updatedSession.id,
        fetchAttempts: fetchAttemptRef.current
      });
      isMounted = false;
      controller.abort();
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
      fetchingRef.current = false;
    };
  }, [updatedSession.id, updatedSession.audioUrl]);

  // Early return if no session
  if (!session?.id) {
    return <div>Loading...</div>;
  }

  const handleTitleUpdate = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleSessionUpdate = (newSession: Session) => {
    // console.log('ClientSessionView: Updating session:', {
    //   oldUrl: updatedSession.audioUrl,
    //   newUrl: newSession.audioUrl
    // });
    
    setUpdatedSession(newSession);
    // Reset fetch state to trigger a new signed URL fetch
    initialFetchDoneRef.current = false;
    fetchingRef.current = false;
  };

  return (
    <div className="space-y-8 pb-40">
      {/* Hero section with background image */}
      <div className="relative aspect-square sm:aspect-video w-full overflow-hidden rounded-xl bg-slate-900">
        {/* Background image or gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/50 to-slate-950/30" />

        {/* Controls overlay */}
        <div className="absolute top-4 left-4 right-4 z-30">
          <ClientSessionControls 
            session={updatedSession}
            isOwner={isOwner}
            currentTitle={title}
            transcriptStatus={updatedSession.transcriptStatus}
            transcriptUrl={updatedSession.transcriptUrl}
            signedAudioUrl={signedAudioUrl}
            onTitleGenerated={handleTitleUpdate}
            onSessionUpdate={handleSessionUpdate}
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
              <Link href={`/profile/${updatedSession.user?.username}`}>
                <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                  <AvatarImage 
                    src={updatedSession.user?.avatar || ''} 
                    alt={userName}
                  />
                  <AvatarFallback>
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Link 
                href={`/profile/${updatedSession.user?.username}`}
                className="text-sm font-medium hover:underline"
              >
                {userName}
              </Link>
            </div>

            {/* Metadata row */}
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <span>{new Date(updatedSession.createdAt).toLocaleDateString()}</span>
              {updatedSession.duration && (
                <>
                  <span>•</span>
                  <span>{formatDuration(updatedSession.duration || 0)}</span>
                </>
              )}
              {!updatedSession.isPublic && (
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
      {updatedSession.summary && (
        <div>
          <h2 className="text-base font-semibold text-slate-500 mb-4">Summary</h2>
          <div className="rounded-xl bg-white dark:bg-slate-800/30 p-4 shadow-sm text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
            {updatedSession.summary}
          </div>
        </div>
      )}

      {/* Learnings section */}
      {updatedSession.learnings && updatedSession.learnings.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-slate-500 mb-4">Key Learnings</h2>
          <ul className="space-y-2">
            {updatedSession.learnings.map((learning, index) => (
              <li 
                key={index}
                className="rounded-xl bg-white dark:bg-slate-800/30 p-4 shadow-sm text-slate-600 dark:text-slate-300 text-sm leading-relaxed"
              >
                {learning}
              </li>
            ))}
          </ul>
        </div>
      )}


    {/* Audio Player */}
    <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {updatedSession?.id && (
            <AudioPlayer
              session={updatedSession}
              isOwner={isOwner}
              userAvatarUrl={updatedSession.user?.avatar}
              userName={userName}
              onSessionUpdate={handleSessionUpdate}
              initialSignedUrl={signedAudioUrl}
            />
          )}
        </div>
      </div>  
    </div>
  );
} 