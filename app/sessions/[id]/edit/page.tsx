'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Globe, Lock, X, ArrowLeft } from 'lucide-react';
import { useUser } from '@clerk/nextjs'; // Import useUser hook from Clerk
import { Textarea } from '@/components/ui/textarea';
import { Loading } from '@/components/ui/loading';
import { ActionButton } from '@/components/ui/action-button';
import { DeleteSession } from '@/components/session/DeleteSession';

export default function SessionEditPage() {
  const { id } = useParams();
  const [session, setSession] = useState<Session | null>(null);
  const [originalSession, setOriginalSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser(); // Get the current user
  const [learnings, setLearnings] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      console.log('Fetching session with ID:', id);
      fetchSession(id as string);
    }
  }, [id]);

  useEffect(() => {
    if (session?.learnings) {
      setLearnings(session.learnings);
    }
  }, [session?.learnings]);

  const fetchSession = async (sessionId: string) => {
    try {
      console.log('Fetching session with ID:', sessionId);
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch session: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      
      // Check if the current user is the owner of the session
      if (user?.id !== data.userId) {
        router.push(`/sessions/${sessionId}`); // Redirect to session detail page if not the owner
        return;
      }
      
      setSession(data);
      setOriginalSession(data);
    } catch (err) {
      console.error('Error fetching session:', err);
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

  const handleLearningChange = (index: number, value: string) => {
    setLearnings(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeLearning = (index: number, e: React.MouseEvent) => {
    // Prevent the button click from submitting the form
    e.preventDefault();
    e.stopPropagation();
    
    setLearnings(prev => prev.filter((_, i) => i !== index));
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
          isPublic: session.isPublic,
          learnings: learnings
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update session');
      }
      
      // Force a refresh of the next page
      router.refresh();
      router.push(`/sessions/${id}`);
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const hasChanges = () => {
    if (!session || !originalSession) return false;
    
    // Add learnings comparison to detect changes
    const learningsChanged = JSON.stringify(learnings) !== JSON.stringify(originalSession.learnings);
    
    return (
      session.title !== originalSession.title ||
      session.summary !== originalSession.summary ||
      session.isPublic !== originalSession.isPublic ||
      learningsChanged
    );
  };

  const handleCancel = () => {
    // Reset all form fields to original values
    if (originalSession) {
      setSession(originalSession);
      setLearnings(originalSession.learnings || []);
    }
  };

  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!session) return <Loading />;

  // Add an extra check here to ensure the user is the owner
  if (user?.id !== session.userId) {
    router.push(`/sessions/${id}`);
    return null;
  }

  return (
    <div className="container mx-auto">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between p-4 space-y-0">
          <div className="flex items-center space-x-4">
            <ActionButton 
              Icon={ArrowLeft} 
              onClick={() => router.push(`/sessions/${id}`)}
              aria-label="Back to session"
              variant="dark"
            />
            <h1 className="text-2xl font-bold leading-none m-0">Edit Session</h1>
          </div>
          {session && <DeleteSession sessionId={id as string} userId={session.userId} />}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-500">Title</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  {session.isPublic ? (
                    <Globe className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                </div>
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={session.title}
                  onChange={handleInputChange}
                  required
                  className="pl-10"
                />
              </div>
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
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-500">Summary</label>
              <Textarea
                id="summary"
                name="summary"
                value={session.summary || ''}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            {learnings.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Key Learnings</h3>
                <div className="space-y-4">
                  {learnings.map((learning, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={learning}
                        onChange={(e) => handleLearningChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <button
                        type="button"
                        onClick={(e) => removeLearning(index, e)}
                        className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {hasChanges() && (
            <Button 
              type="button"
              onClick={handleCancel}
              variant="ghost"
            >
              Cancel
            </Button>
          )}
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
