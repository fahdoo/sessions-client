'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from '@/lib/hooks/useToast';
import { AudiogramPreview, RenderConfig } from '@/components/audiogram/AudiogramPreview';

interface Session {
  id: string;
  title: string;
  created_at: string;
  audio_url: string;
  duration: number | null;
  user: {
    avatar: string;
    username: string;
  };
  transcript_url: string;
}

interface Video {
  id: string;
  session_id: string;
  render_id: string;
  format: string;
  status: string;
  video_url: string | null;
  width: number | null;
  height: number | null;
}

interface Props {
  sessions: Session[];
}

// Add helper function to format duration
function formatDuration(seconds: number | null) {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function RemotionTest({ sessions }: Props) {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderId, setRenderId] = useState<string | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedSessionData, setSelectedSessionData] = useState<Session | null>(null);

  // Add initial fetch on mount
  useEffect(() => {
    const fetchInitialVideos = async () => {
      try {
        const response = await fetch(`/api/remotion/videos`); // No sessionId filter initially
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data.videos);
      } catch (error) {
        console.error('Error fetching videos:', error);
      }
    };

    fetchInitialVideos();
  }, []); // Empty deps array for mount only

  // Fetch existing videos when session is selected
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch(`/api/remotion/videos${selectedSession ? `?sessionId=${selectedSession}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(prevVideos => {
          // Keep existing videos if we're filtering by session
          if (selectedSession) {
            return data.videos;
          }
          // Otherwise merge with existing videos
          const existingIds = new Set(prevVideos.map((v: Video) => v.id));
          const newVideos = data.videos.filter((v: Video) => !existingIds.has(v.id));
          return [...prevVideos, ...newVideos];
        });
      } catch (error) {
        console.error('Error fetching videos:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch existing videos',
          variant: 'destructive',
        });
      }
    };

    fetchVideos();
  }, [selectedSession, toast]);

  // Poll for video status when we have a renderId
  useEffect(() => {
    if (!renderId) return;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/remotion/status?renderId=${renderId}`);
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        
        // Stop polling on any final status
        if (['completed', 'failed', 'timeout'].includes(data.status)) {
          setIsRendering(false);
          setRenderId(null);
          clearInterval(interval);

          // Show appropriate toast
          if (data.status === 'completed') {
            toast({
              title: 'Video Ready',
              description: 'Your video has been generated successfully!'
            });
          } else {
            toast({
              title: 'Render Failed',
              description: `Video rendering ${data.status}`,
              variant: 'destructive',
            });
          }

          // Refresh videos list one final time
          const videosResponse = await fetch(`/api/remotion/videos?sessionId=${selectedSession}`);
          const videosData = await videosResponse.json();
          setVideos(videosData.videos);
          return;
        }

        // Only refresh videos list periodically for pending status
        const videosResponse = await fetch(`/api/remotion/videos?sessionId=${selectedSession}`);
        const videosData = await videosResponse.json();
        setVideos(videosData.videos);
      } catch (error) {
        console.error('Status polling error:', error);
        setIsRendering(false);
        setRenderId(null);
      }
    };

    // Poll every 5 seconds
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, [renderId, selectedSession, toast]);

  const handleRender = async (config: RenderConfig) => {
    if (!selectedSession) return;

    setIsRendering(true);
    try {
      const response = await fetch('/api/remotion/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          sessionId: selectedSession,
          config 
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
      console.error('Render error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start render',
        variant: 'destructive',
      });
    } finally {
      setIsRendering(false);
    }
  };

  // Update useEffect for session selection
  useEffect(() => {
    if (!selectedSession) {
      setSelectedSessionData(null);
      return;
    }

    const session = sessions.find(s => s.id === selectedSession);
    if (session) {
      setSelectedSessionData(session);
    }
  }, [selectedSession, sessions]);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sessions</h2>
        <div className="space-y-4 max-w-md">
          <label className="block text-sm font-medium">Select Session</label>
          <Select
            value={selectedSession}
            onValueChange={setSelectedSession}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a session" />
            </SelectTrigger>
            <SelectContent>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.title || 'Untitled'} 
                  {session.duration && (
                    <span className="text-gray-500 ml-2">
                      ({formatDuration(session.duration)})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => setShowPreview(true)}
            disabled={!selectedSession || isRendering}
          >
            {isRendering ? 'Rendering...' : 'Generate Video'}
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Videos Rendered</h2>
        {videos.map((video) => {
          const session = sessions.find(s => s.id === video.session_id);
          if (!session) return null;

          return (
            <div key={video.id} className="mb-4 p-4 border rounded">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">
                        {session.title || 'Untitled'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Format: {video.format.charAt(0).toUpperCase() + video.format.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Status: {video.status}
                      </div>
                    </div>
                    {video.video_url && video.status === 'completed' && (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          onClick={() => setSelectedVideo(video)}
                        >
                          Preview
                        </Button>
                        <Button 
                          variant="outline"
                          asChild
                        >
                          <a 
                            href={video.video_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center"
                          >
                            Download
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog 
        open={showPreview} 
        onOpenChange={setShowPreview}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Preview & Configure Video
            </DialogTitle>
          </DialogHeader>
          {selectedSessionData && (
            <AudiogramPreview
              session={{
                audioUrl: selectedSessionData.audio_url,
                title: selectedSessionData.title,
                user: {
                  avatar: selectedSessionData.user.avatar,
                  username: selectedSessionData.user.username
                },
                transcriptUrl: selectedSessionData.transcript_url,
                duration: selectedSessionData.duration || 30
              }}
              onRender={handleRender}
            />
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