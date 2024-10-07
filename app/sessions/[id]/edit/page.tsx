'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { Session } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SessionEditPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetchSession(id as string);
    }
  }, [id]);

  const fetchSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSession(prev => prev ? { ...prev, [name]: value } : null);
  };

  const toggleVisibility = async () => {
    if (!session) return;
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_public: !session.isPublic }),
      });
      if (!response.ok) {
        throw new Error('Failed to update session visibility');
      }
      const updatedSession = await response.json();
      setSession(updatedSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: session.title,
          summary: session.summary,
          is_public: session.isPublic,
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update session');
      }
      router.push(`/sessions/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Edit Session</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <Input
            type="text"
            id="title"
            name="title"
            value={session.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">Summary</label>
          <Textarea
            id="summary"
            name="summary"
            value={session.summary}
            onChange={handleInputChange}
            rows={4}
          />
        </div>
        <div className="flex justify-between items-center">
          <Button 
            type="button" 
            onClick={toggleVisibility} 
            variant="outline"
          >
            {session.isPublic ? 'Make Private' : 'Make Public'}
          </Button>
          <Button 
            type="submit"
            variant="outline"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}