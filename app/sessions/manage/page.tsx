'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import SessionCard from '@/components/session/session-card';
import { Session } from '@/lib/types';

export default function ManageSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch('/api/sessions/mine');
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          throw new Error('Failed to fetch sessions');
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        // TODO: Add error handling UI
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Sessions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map(session => (
          <SessionCard 
            key={session.id} 
            session={session}
            showUser={false}
            showDuration={true}
            showViews={true}
            showSummary={true}
          />
        ))}
      </div>
      <div className="mt-8">
        <Link href="/sessions/create">
          <Button>Create New Session</Button>
        </Link>
      </div>
    </div>
  );
}