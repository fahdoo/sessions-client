'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { AudioPlayer } from '@/components/session/audio-player';
import { TranscriptionDisplay } from '@/components/session/transcription-display';
import { Session } from '@/lib/types';
import { Globe, Lock, MoreVertical, Wand2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from '@clerk/nextjs';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { Participant } from 'livekit-client';
import { generateTitle } from '@/lib/title-generation';
import { EditableTitle } from '@/components/session/editable-title';
import { GenerateTitleButton } from '@/components/session/generate-title-button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type TranscriptData = {
  metadata: {
    sessionId: string;
    startTime: string;
    endTime: string;
    participants: Participant[];
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
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [titleGenerationError, setTitleGenerationError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        const sessionResponse = await fetch(`/api/sessions/${params.id}`);
        if (!sessionResponse.ok) throw new Error('Failed to fetch session');
        const sessionData = await sessionResponse.json();
        setSession(sessionData);
        setSummary(sessionData.summary);
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
    if (transcriptData) return transcriptData; // Return existing data if available
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
      return data;
    } catch (err) {
      console.error('Error fetching transcript:', err);
      setError('Failed to load transcript');
      return null;
    } finally {
      setIsTranscriptLoading(false);
    }
  }, [params.id, transcriptData]);

  const handleViewTranscript = useCallback(async () => {
    setIsTranscriptDialogOpen(true);
    await fetchTranscript();
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
      
      setSession(prevSession => ({
        ...prevSession!,
        ...updatedSessionData,
        user: prevSession!.user
      }));
    } catch (err) {
      console.error('Error updating session visibility:', err);
    }
  }, [session]);

  const handleGenerateTitle = useCallback(async () => {
    if (!session) return;

    setIsGeneratingTitle(true);
    setTitleGenerationError(null);
    try {
      const transcript = await fetchTranscript();
      if (!transcript || transcript.transcript.length === 0) {
        setTitleGenerationError('No transcript available');
        return;
      }

      const fullTranscript = transcript.transcript.map(t => t.text).join(' ');
      if (fullTranscript.length <= 100) {
        setTitleGenerationError('Transcript is too short to generate a title');
        return;
      }

      const generatedTitle = await generateTitle(fullTranscript, session.title, session.id);
      if (generatedTitle) {
        setSession(prev => ({ ...prev!, title: generatedTitle }));
      }
    } catch (error) {
      console.error('Error generating title:', error);
      setTitleGenerationError('Failed to generate title');
    } finally {
      setIsGeneratingTitle(false);
    }
  }, [session, fetchTranscript]);

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
        <div className="flex-grow">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold mb-1 mr-2">{session.title}</h1>
            {isOwner && session.transcriptUrl && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <GenerateTitleButton
                        isGenerating={isGeneratingTitle}
                        onClick={handleGenerateTitle}
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    {titleGenerationError || 'Generate new title'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
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

      <div className="mb-12">
        {summary || ""}
      </div>

      <Dialog open={isTranscriptDialogOpen} onOpenChange={setIsTranscriptDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          {isTranscriptLoading ? (
            <div>Loading transcript...</div>
          ) : transcriptData ? (
            <TranscriptionDisplay 
              transcript={transcriptData.transcript} 
              userName={session.user.firstName}
              userAvatar={session.user.avatar}
            />
          ) : (
            <div>Failed to load transcript</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
