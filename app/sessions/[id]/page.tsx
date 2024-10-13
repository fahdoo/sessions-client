'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AudioPlayer } from '@/components/session/audio-player';
import { TranscriptionDisplay } from '@/components/session/transcription-display';
import { Session } from '@/lib/types';
import { Globe, Lock, MoreVertical } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from 'next/link';

type TranscriptData = {
  metadata: {
    sessionId: string;
    startTime: string;
    endTime: string;
    participants: Array<{
      id: string;
      name: string;
      type: 'human' | 'ai';
    }>;
  };
  transcript: Array<{
    id: string;
    participantId: string;
    text: string;
    startTime: number;
    endTime: number;
    language: string;
    isFinal: boolean;
  }>;
};

export default function SessionView({ params }: { params: { id: string } }) {
  const [session, setSession] = useState<Session | null>(null);
  const [transcriptData, setTranscriptData] = useState<TranscriptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTranscriptDialogOpen, setIsTranscriptDialogOpen] = useState(false);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    const fetchSession = async () => {
      try {
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

  const fetchTranscript = useCallback(async () => {
    if (transcriptData) return; // Don't fetch if we already have the data
    setIsTranscriptLoading(true);
    try {
      const transcriptResponse = await fetch(`/api/sessions/${params.id}/transcript`);
      if (!transcriptResponse.ok) {
        throw new Error('Failed to fetch transcript URL');
      }
      const { transcriptUrl } = await transcriptResponse.json();
      
      const transcriptContentResponse = await fetch(transcriptUrl);
      if (!transcriptContentResponse.ok) {
        throw new Error('Failed to fetch transcript content');
      }
      const data: TranscriptData = await transcriptContentResponse.json();
      setTranscriptData(data);
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError('Failed to load transcript');
    } finally {
      setIsTranscriptLoading(false);
    }
  }, [params.id, transcriptData]);

  const handleViewTranscript = useCallback(() => {
    setIsTranscriptDialogOpen(true);
    fetchTranscript();
  }, [fetchTranscript]);

  const toggleVisibility = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`/api/sessions/${session.id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !session.isPublic }),
      });
      if (!response.ok) throw new Error('Failed to update session visibility');
      const updatedSessionData = await response.json();
      
      // Preserve the existing user data when updating the session state
      setSession(prevSession => ({
        ...prevSession!,
        ...updatedSessionData,
        user: prevSession!.user // Keep the existing user data
      }));
    } catch (err) {
      console.error('Error updating session visibility:', err);
      // You might want to show an error message to the user here
    }
  }, [session]);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  if (!session) return <div className="flex justify-center items-center h-screen">Session not found</div>;

  const isOwner = user?.id === session.userId;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 flex justify-between items-center">
        {isOwner ? (
          <div className="flex items-center space-x-2">
            <Switch
              checked={session.isPublic}
              onCheckedChange={toggleVisibility}
              id="visibility-toggle"
            />
            <Label htmlFor="visibility-toggle">
              {session.isPublic ? (
                <>
                  <Globe className="inline-block mr-1 h-4 w-4" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="inline-block mr-1 h-4 w-4" />
                  Private
                </>
              )}
            </Label>
          </div>
        ) : (
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
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOwner && (
              <DropdownMenuItem onClick={() => router.push(`/sessions/${params.id}/edit`)}>
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={handleViewTranscript}>
              View Transcript
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mb-12 flex items-center space-x-4">
        <Link href={`/profile/${session.user.username}`}>
          <Avatar className="w-16 h-16">
            <AvatarImage src={session.user.avatar} alt={`${session.user.firstName} ${session.user.lastName}`} />
            <AvatarFallback>{session.user.firstName[0]}{session.user.lastName[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-1">{session.title}</h1>
          <p className="text-lg text-slate-400">
            <Link href={`/profile/${session.user.username}`} className="hover:underline">
              {session.user.firstName} {session.user.lastName}
            </Link>
          </p>
        </div>
      </div>

      <div className="mb-12">
        {session.id && (
          <AudioPlayer sessionId={session.id} />
        )}
      </div>

      <Dialog open={isTranscriptDialogOpen} onOpenChange={setIsTranscriptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {isTranscriptLoading ? (
            <div>Loading transcript...</div>
          ) : transcriptData ? (
            <TranscriptionDisplay 
              transcript={transcriptData.transcript} 
              userName={session.user.firstName}
            />
          ) : (
            <div>Failed to load transcript</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
