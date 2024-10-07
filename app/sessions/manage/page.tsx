'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Session {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

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
    <div className="container mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Manage Your Sessions</h1>
      {sessions.length === 0 ? (
        <p>You haven't created any sessions yet.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="border p-4 rounded-md">
              <h2 className="text-xl font-semibold">{session.title}</h2>
              <p>Status: {session.status}</p>
              <p>Created: {new Date(session.created_at).toLocaleDateString()}</p>
              <div className="mt-2">
                <Link href={`/sessions/${session.id}`}>
                  <Button variant="outline" className="mr-2">View</Button>
                </Link>
                <Link href={`/sessions/${session.id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-8">
        <Link href="/create-session">
          <Button>Create New Session</Button>
        </Link>
      </div>
    </div>
  );
}