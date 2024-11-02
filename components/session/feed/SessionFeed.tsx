'use client'; 

import { useState, useEffect, useCallback } from 'react';
import SessionCard from '@/components/session/feed/SessionCard';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';
import { PlayerContext } from '@/components/session/audio/PlayerContext';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/ui/error-boundary';

interface SessionFeedProps {
  fetchUrl: string;
  showUser?: boolean;
  showDuration?: boolean;
  showSummary?: boolean;
  isOwner?: boolean;
  showAudioPlayer?: boolean;
  limit?: number;
}

interface SessionResponse {
  sessions: Session[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

export default function SessionFeed({
  fetchUrl,
  showUser = true,
  showDuration = false,
  showSummary = false,
  isOwner = false,
  showAudioPlayer = false,
  limit = 9,
}: SessionFeedProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [playingSessionId, setPlayingSessionId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${fetchUrl}?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.status}`);
      }
      const data: SessionResponse = await response.json();
      setSessions(prevSessions => 
        page === 1 ? data.sessions : [...prevSessions, ...data.sessions]
      );
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchUrl, page, limit]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <ErrorBoundary>
      <PlayerContext.Provider value={{ playingSessionId, setPlayingSessionId }}>
        <div className="container mx-auto">
          <div className={`mx-auto grid grid-cols-1 gap-5`}>
            {loading && page === 1 && (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-slate-500 dark:text-slate-400">Loading sessions...</span>
              </div>
            )}
            
            {!loading && sessions.length === 0 && (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                No sessions found.
              </p>
            )}
            
            {sessions.map(session => (
              <SessionCard 
                key={session.id}
                session={session}
                showUser={showUser}
                showDuration={showDuration}
                showSummary={showSummary}
                isOwner={isOwner}
                showAudioPlayer={showAudioPlayer}
              />
            ))}
          </div>
          
          {!loading && sessions.length > 0 && hasMore && (
            <Button 
              onClick={handleLoadMore} 
              className="mt-6 mx-auto block"
              variant="secondary"
              disabled={loading}
            >
              {loading && page > 1 ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading more...</span>
                </div>
              ) : (
                'Load More'
              )}
            </Button>
          )}
        </div>
      </PlayerContext.Provider>
    </ErrorBoundary>
  );
}
