'use client';

import { useState, useEffect } from 'react';
import LoadingIndicator from '@/components/LoadingIndicator';
import WaveformPlayer from '@/components/session/audio/WaveformPlayer';
import { Card } from '@/components/ui/card';
import ErrorBoundary from '@/components/ui/error-boundary';
import { Session } from '@/lib/types';

interface AudioPlayerProps {
  session: Session;
  isOwner: boolean;
  userAvatarUrl?: string | null;
  userName: string;
  onSessionUpdate?: (updatedSession: Session) => void;
  initialSignedUrl?: string;
}

export function AudioPlayer({ 
  session, 
  isOwner,
  userAvatarUrl, 
  userName,
  onSessionUpdate,
  initialSignedUrl 
}: AudioPlayerProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(initialSignedUrl || null);
  const [status, setStatus] = useState<'loading' | 'processing' | 'ready' | 'error'>(
    initialSignedUrl ? 'ready' : 'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update audioUrl when initialSignedUrl changes
  useEffect(() => {
    // console.log('AudioPlayer: initialSignedUrl changed:', { initialSignedUrl });
    if (initialSignedUrl) {
      setAudioUrl(initialSignedUrl);
      setStatus('ready');
    }
  }, [initialSignedUrl]);

  // Early return if no session
  if (!session?.id) {
    // console.log('AudioPlayer: No session ID');
    return (
      <Card className="bg-slate-400/40 backdrop-blur-md rounded-xl p-4 border-0 relative">
        <div className="text-center py-8 text-slate-500">
          No session available
        </div>
      </Card>
    );
  }

  // console.log('AudioPlayer render:', { 
  //   audioUrl, 
  //   status, 
  //   hasInitialUrl: !!initialSignedUrl 
  // });

  return (
    <ErrorBoundary>
      <Card className="bg-slate-400/40 backdrop-blur-md rounded-xl p-4 border-0 relative">  
        {status === 'loading' && (
          <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-zinc-800/75 backdrop-blur-md z-10">
            <LoadingIndicator message="Loading audio..." />
          </div>
        )}

        {status === 'error' && (
          <div className="text-red-500">Error: {errorMessage}</div>
        )}

        {audioUrl ? (
          <WaveformPlayer 
            key={audioUrl}
            audioUrl={audioUrl} 
            avatarUrl={userAvatarUrl}
            title={session.title}
            artist={userName}
          />
        ) : (
          <div className="text-center py-8 text-slate-500">
            {status === 'error' ? errorMessage : 'Loading audio...'}
          </div>
        )}
      </Card>
    </ErrorBoundary>
  );
}
