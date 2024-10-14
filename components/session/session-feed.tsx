'use client'; 

import { useState, useEffect, useCallback } from 'react';
import SessionCard from '@/components/session/session-card';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';

interface SessionFeedProps {
  fetchUrl: string;
  showUser?: boolean;
  showDuration?: boolean;
  showViews?: boolean;
  showSummary?: boolean;
  isOwner?: boolean;
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
}: SessionFeedProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${fetchUrl}?page=${page}`);
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
  }, [fetchUrl, page]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto space-y-6">
        {loading && page === 1 && <p className="text-center">Loading...</p>}
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
          />
        ))}
      </div>
      {!loading && hasMore && (
        <Button onClick={handleLoadMore} className="mt-6 mx-auto block">
          Load More
        </Button>
      )}
      {loading && page > 1 && <p className="text-center mt-4">Loading more...</p>}
    </div>
  );
}
