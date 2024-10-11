'use client';

import { useEffect, useState, useCallback } from 'react';
import SessionCard from '@/components/session/session-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Session } from '@/lib/types';

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/public?page=${page}&search=${searchTerm}`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(prevSessions => page === 1 ? data.sessions : [...prevSessions, ...data.sessions]);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feed</h1>
      <Input
        type="text"
        placeholder="Search sessions..."
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => (
          <SessionCard 
            key={session.id}
            session={session}
            showUser={true}
            showDuration={true}
            showSummary={false}
          />
        ))}
      </div>
      {loading && <p className="text-center mt-4">Loading...</p>}
      {!loading && page < totalPages && (
        <Button onClick={handleLoadMore} className="mt-6 mx-auto block">
          Load More
        </Button>
      )}
    </div>
  );
}