'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AudioPlayer from '@/components/session/audio-player';

interface Session {
  id: string;
  title: string;
  summary: string;
  audioUrl: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

export default function SessionView() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    if (id) {
      fetchSession();
    }
  }, [id]);

  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!session) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
      {session.user && (
        <p className="text-gray-600 mb-4">
          By {session.user.firstName} {session.user.lastName}
        </p>
      )}
      {session.summary && <p className="mb-6">{session.summary}</p>}
      {session.audioUrl && <AudioPlayer audioUrl={session.audioUrl} />}
    </div>
  );
}