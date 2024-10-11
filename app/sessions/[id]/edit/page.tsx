'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@clerk/nextjs';
import { Session } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock } from 'lucide-react';

export default function SessionEditPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [originalSession, setOriginalSession] = useState<Session | null>(null);
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
      setOriginalSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSession(prev => prev ? { ...prev, [name]: value } : null);
  };

  const toggleVisibility = (checked: boolean) => {
    setSession(prev => prev ? { ...prev, isPublic: checked } : null);
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

  const hasChanges = () => {
    if (!session || !originalSession) return false;
    return (
      session.title !== originalSession.title ||
      session.summary !== originalSession.summary ||
      session.isPublic !== originalSession.isPublic
    );
  };

  if (error) return <div>Error: {error}</div>;
  if (!session) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <h1 className="text-3xl font-bold">Edit Session</h1>
        </CardHeader>
        <CardContent>
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
            <div className="flex items-center space-x-2">
              <Switch
                checked={session.isPublic}
                onCheckedChange={toggleVisibility}
                id="visibility-switch"
              />
              <label htmlFor="visibility-switch" className="text-sm font-medium text-slate-400 flex items-center">
                {session.isPublic ? (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Private
                  </>
                )}
              </label>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={!hasChanges()}
          >
            Save
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}