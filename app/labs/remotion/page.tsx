'use client';

import { useEffect, useState } from 'react';
import { Session } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/lib/hooks/useToast';
import { AudiogramPreview, RenderConfig } from '@/components/audiogram/AudiogramPreview';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AudiogramSession {
  id: string;
  title: string;
  audioUrl: string;
  transcriptData?: string;
  duration: number;
  user: {
    avatar: string;
    username: string;
  };
}

// Add helper function at the top
const getVideoStatus = (video: any) => {
  if (video.status === 'completed') return 'completed';
  
  // Check if processing for more than 5 minutes
  const processingTime = Date.now() - new Date(video.created_at).getTime();
  const MAX_PROCESSING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  if (video.status === 'processing' && processingTime > MAX_PROCESSING_TIME) {
    return 'failed';
  }
  
  return video.status;
};

export default function RemotionPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedSessionData, setSelectedSessionData] = useState<AudiogramSession | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [renderedVideos, setRenderedVideos] = useState<Record<string, any[]>>({});

  // Fetch sessions
  useEffect(() => {
    let mounted = true;

    const fetchSessions = async () => {
      if (!mounted) return;
      
      try {
        const response = await fetch('/api/sessions/mine');
        if (!response.ok) throw new Error('Failed to fetch sessions');
        const data = await response.json();
        
        if (mounted) {
          setSessions(Array.isArray(data.sessions) ? data.sessions : []);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
        if (mounted) {
          toast({
            title: 'Error',
            description: 'Failed to load sessions',
            variant: 'destructive',
          });
          setSessions([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSessions();

    return () => {
      mounted = false;
    };
  }, [toast]);

  // Fetch selected session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!selectedSession) {
        setSelectedSessionData(null);
        return;
      }

      try {
        console.log('Fetching session data for:', selectedSession);
        const response = await fetch(`/api/sessions/${selectedSession}/audiogram`);
        console.log('API Response status:', response.status);
        
        if (!response.ok) throw new Error('Failed to fetch session data');
        const data = await response.json();
        console.log('Received session data:', {
          id: data.id,
          hasTranscriptData: !!data.transcriptData,
          transcriptDataLength: data.transcriptData?.length
        });
        
        setSelectedSessionData(data);
      } catch (error) {
        console.error('Error fetching session data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load session data',
          variant: 'destructive',
        });
      }
    };

    fetchSessionData();
  }, [selectedSession, toast]);

  // Add effect to fetch rendered videos
  useEffect(() => {
    const fetchRenderedVideos = async () => {
      try {
        const response = await fetch('/api/remotion/renders');
        if (!response.ok) throw new Error('Failed to fetch renders');
        const data = await response.json();
        
        // Group videos by session ID
        const grouped = data.reduce((acc: Record<string, any[]>, video: any) => {
          if (!acc[video.session_id]) acc[video.session_id] = [];
          acc[video.session_id].push(video);
          return acc;
        }, {});
        
        setRenderedVideos(grouped);
      } catch (error) {
        console.error('Error fetching rendered videos:', error);
      }
    };

    fetchRenderedVideos();
  }, [renderId]); // Refetch when new render is started

  const handleRender = async (config: RenderConfig) => {
    if (!selectedSession) return;

    const session = sessions.find(s => s.id === selectedSession);
    const transcriptUrl = session?.audioUrl?.replace('.m4a', '.json');

    setIsRendering(true);
    try {
      const response = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: selectedSession,
          config,
          format: config.format,
          transcriptUrl: transcriptUrl || undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start render');
      }

      const { renderId: newRenderId } = await response.json();
      setRenderId(newRenderId);
      setShowPreview(false);
      
      toast({
        title: 'Render Started',
        description: 'Your video is being generated...',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start render',
        variant: 'destructive',
      });
    } finally {
      setIsRendering(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Remotion Video Generator</h1>
      
      <div className="space-y-4">
        {sessions.map((session) => (
          <Accordion type="single" collapsible key={session.id}>
            <AccordionItem value={session.id}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      {Math.floor((session.duration ?? 0) / 60)}:{((session.duration ?? 0) % 60).toString().padStart(2, '0')}
                    </p>
                    <h3 className="font-semibold text-left">{session.title}</h3>
                  </div>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSession(session.id);
                      setShowPreview(true);
                    }}
                  >
                    Generate New
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {renderedVideos[session.id]?.map((video, index) => {
                    const status = getVideoStatus(video);
                    
                    return (
                      <div 
                        key={video.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">Render #{index + 1}</p>
                            <Badge 
                              variant={
                                status === 'completed' ? 'outline' : 
                                status === 'failed' ? 'destructive' : 
                                'secondary'
                              }
                            >
                              {status === 'completed' ? 'Ready' : 
                               status === 'failed' ? 'Failed' : 
                               'Processing'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(video.created_at).toLocaleString()}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          onClick={() => setSelectedVideo(video)}
                          disabled={status !== 'completed'}
                        >
                          {status === 'completed' ? 'View' : 
                           status === 'failed' ? 'Failed' : 
                           'Processing...'}
                        </Button>
                      </div>
                    );
                  })}
                  {!renderedVideos[session.id]?.length && (
                    <p className="text-gray-500 text-center">No renders yet</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>

      <Dialog 
        open={showPreview} 
        onOpenChange={setShowPreview}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Preview & Configure Video
            </DialogTitle>
          </DialogHeader>
          {selectedSessionData && (
            <div className="max-h-[calc(90vh-10rem)] overflow-y-auto">
              <AudiogramPreview
                session={{
                  audioUrl: selectedSessionData.audioUrl ?? '',
                  title: selectedSessionData.title,
                  user: {
                    avatar: selectedSessionData.user?.avatar ?? '',
                    username: selectedSessionData.user?.username ?? ''
                  },
                  duration: selectedSessionData.duration ?? 30,
                  transcriptData: selectedSessionData.transcriptData
                }}
                onRender={handleRender}
                isRendering={isRendering}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!selectedVideo} 
        onOpenChange={(open) => !open && setSelectedVideo(null)}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {sessions.find(s => s.id === selectedVideo?.session_id)?.title || 'Video Preview'}
            </DialogTitle>
          </DialogHeader>
          {selectedVideo?.video_url && (
            <div className="aspect-square relative">
              <video 
                src={selectedVideo.video_url}
                controls
                className="w-full h-full rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 