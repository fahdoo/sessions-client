'use client'; 

import { useState, useEffect, useCallback } from 'react';
import SessionCard from '@/components/session/session-card';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';
import { Skeleton } from "@/components/ui/skeleton";

interface SessionFeedProps {
  fetchUrl: string;
  showUser?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showSummary?: boolean;
  isOwner?: boolean;
  showAudioPlayer?: boolean;
  layout?: 'grid' | 'list';
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
  showViews = false,
  showSummary = false,
  isOwner = false,
  showAudioPlayer = false,
  layout = 'list',
  limit = 9,
}: SessionFeedProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

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
    <div className="container mx-auto">
      <div className={`mx-auto grid grid-cols-1 md:grid-cols-2 gap-4`}>
        {loading && page === 1 && <LoadingSkeleton count={limit} />}
        {!loading && sessions.length === 0 && <p className="text-center">No sessions found.</p>}
        {sessions.map(session => (
          <SessionCard 
            key={session.id}
            session={session}
            showUser={showUser}
            showDuration={showDuration}
            showViews={showViews}
            showSummary={showSummary}
            isOwner={isOwner}
            showAudioPlayer={showAudioPlayer}
          />
        ))}
        {loading && page > 1 && <LoadingSkeleton count={limit} />}
      </div>
      {hasMore && (
        <Button 
          onClick={handleLoadMore} 
          className="mt-6 mx-auto block"
          variant="secondary"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}

function LoadingSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-32 w-full rounded" />
        </div>
      ))}
    </>
  );
}
