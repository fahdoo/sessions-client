'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AudioPlayer } from '@/components/session/audio-player';
import { TranscriptDisplay } from '@/components/session/transcript-display';
import { Session } from '@/lib/types';
import { Globe, Lock, MoreVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs'; // Import useUser hook from Clerk

export default function SessionView({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useUser(); // Get the current user

  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Fetch session details
        const sessionResponse = await fetch(`/api/sessions/${params.id}`);
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        setSession(sessionData);

      } catch (err) {
        setError('Error fetching session data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [params.id]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  if (!session) return <div className="flex justify-center items-center h-screen">Session not found</div>;

  const isOwner = user?.id === session.userId; // Check if the current user is the owner

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        <Badge 
          variant={session.isPublic ? "secondary" : "outline"}
          className="text-sm"
        >
          {session.isPublic ? (
            <>
              <Globe className="mr-1 h-4 w-4" />
              Public
            </>
          ) : (
            <>
              <Lock className="mr-1 h-4 w-4" />
              Private
            </>
          )}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && ( // Only show the Edit button if the user is the owner
              <DropdownMenuItem onClick={() => router.push(`/sessions/${params.id}/edit`)}>
                Edit
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-12 flex items-center space-x-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src={session.user.avatar} alt={`${session.user.firstName} ${session.user.lastName}`} />
          <AvatarFallback>{session.user.firstName[0]}{session.user.lastName[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold mb-1">{session.title}</h1>
          <p className="text-lg text-slate-600">{session.user.firstName} {session.user.lastName}</p>
        </div>
      </div>

      <div className="mb-12">
        {session.id && (
          <AudioPlayer sessionId={session.id} />
        )}
      </div>

      {session.id && <TranscriptDisplay sessionId={session.id} />}
    </div>
  );
}
