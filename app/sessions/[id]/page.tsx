'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AudioPlayer } from '@/components/ui/audio-player';
import { Session } from '@/lib/types';
import { Globe, Lock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function SessionView({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchSession();
  }, []);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      const data = await response.json();
      setSession(data);
    } catch (err) {
      setError('Error fetching session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  if (!session) return <div className="flex justify-center items-center h-screen">Session not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto relative">
        <Badge 
          variant={session.isPublic ? "secondary" : "outline"}
          className="absolute top-2 right-2 z-10"
        >
          {session.isPublic ? (
            <>
              <Globe className="mr-1 h-3 w-3" />
              Public
            </>
          ) : (
            <>
              <Lock className="mr-1 h-3 w-3" />
              Private
            </>
          )}
        </Badge>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={session.user.avatar} alt={`${session.user.firstName} ${session.user.lastName}`} />
              <AvatarFallback>{session.user.firstName[0]}{session.user.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{session.title}</h1>
              <p className="text-sm text-gray-500">By {session.user.firstName} {session.user.lastName}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-6">{session.summary}</p>
          <AudioPlayer audioUrl={session.audioUrl} />
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline"
            onClick={() => router.push(`/sessions/${params.id}/edit`)}
          >
            Edit Session
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}