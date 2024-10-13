'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Upload, Mic, Shield } from 'lucide-react';
import {
  LiveKitRoom,
  useRoomContext,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
  useVoiceAssistant, 
} from '@livekit/components-react';
import "@livekit/components-styles";
import { Session } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { generateRoomName } from '@/lib/utils';
import { CircleX } from 'lucide-react';
import { Room, TranscriptionSegment, Participant } from 'livekit-client';
import { TranscriptionDrawer } from '@/components/session/transcription-drawer';
import { Badge } from '@/components/ui/badge';
import ErrorBoundary from '@/components/ui/error-boundary';

// Update the sessionState type
type SessionState = {
  token: string;
  roomName: string;
  session: Session | null;
  isRoomReady: boolean;
  isLoading: boolean;
};

// Add this type definition for the transcript state
type TranscriptState = {
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

export default function SessionRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [sessionState, setSessionState] = useState<SessionState>({
    token: '',
    roomName: '',
    session: null,
    isRoomReady: false,
    isLoading: true
  });

  const { token, roomName, session, isRoomReady, isLoading } = sessionState;

  const [transcript, setTranscript] = useState<TranscriptState>({
    metadata: {
      sessionId: id as string,
      startTime: new Date().toISOString(),
      endTime: '',
      participants: []
    },
    transcript: []
  });
  const [room, setRoom] = useState<Room | null>(null);
  const isCleaningUp = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'connecting' | 'recording' | 'uploading' | 'completed'>('connecting');
  const [isRecordingStarted, setIsRecordingStarted] = useState(false);

  useEffect(() => {
    async function setupSession() {
      try {
        console.log('Fetching session data');
        const response = await fetch(`/api/sessions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const sessionData = await response.json();
        console.log('Session data:', sessionData);
        if (sessionData.audioUrl || sessionData.transcriptUrl) {
          console.log('Session already has audio or transcript, redirecting');
          router.push(`/sessions/${id}`);
        } else {
          console.log('Session is new, continuing with recording setup');
          const tokenResponse = await fetch(`/api/livekit/get-token?sessionId=${(id)}`);
          const { token } = await tokenResponse.json();
          console.log('Token:', token);
          if (!token || typeof token !== 'string') {
            throw new Error('Invalid token received from server');
          }

          setSessionState(prev => ({
            ...prev,
            token,
            roomName: generateRoomName(sessionData.id),
            session: sessionData,
            isRoomReady: true,
            isLoading: false
          }));

          // Initialize transcript metadata
          setTranscript((prev: TranscriptState) => ({
            ...prev,
            metadata: {
              ...prev.metadata,
              participants: [
                { id: sessionData.userId, name: sessionData.userName, type: 'human' },
                { id: 'ai-muse-v2', name: 'AI Interviewer', type: 'ai' }
              ]
            }
          }));
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }

    setupSession();
  }, [id, router]);

  const saveTranscript = useCallback(async (isCompleted = false) => {
    if (!transcript || !session) return;

    const response = await fetch(`/api/sessions/${session.id}/transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, isCompleted }),
    });

    if (!response.ok) {
      console.error('Failed to save transcript');
    }
  }, [transcript, session]);

  const pollAudioProcessing = useCallback(async () => {
    const maxAttempts = 30; // 5 minutes (10 seconds * 30)
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`/api/sessions/${id}/audio-url`);
        const data = await response.json();
        
        if (response.ok && data.url) {
          return; // Audio processing is complete
        } else if (response.status === 202) {
          console.log('Audio still processing...');
        } else {
          console.error('Unexpected response:', response.status, data);
        }
      } catch (error) {
        console.error('Error polling audio status:', error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds before next attempt
      attempts++;
    }
    throw new Error('Audio processing timed out');
  }, [id]);

  const cleanupSession = useCallback(async () => {
    if (isCleaningUp.current) return;
    isCleaningUp.current = true;

    console.log('Cleaning up session');
    if (!session) return;

    try {
      // Stop the recording
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session.id), action: 'stop' }),
      });

      // Update end time in transcript metadata
      setTranscript((prev: TranscriptState) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          endTime: new Date().toISOString()
        }
      }));

      // Save the final transcript
      await saveTranscript(true);

      // Disconnect from the room if it's still connected
      if (room && room.state === 'connected') {
        await room.disconnect();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      isCleaningUp.current = false;
    }
  }, [session, room, saveTranscript]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      cleanupSession();
      event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupSession();
    };
  }, [cleanupSession]);

  const handleRoomConnected = useCallback(async (room: Room) => {
    console.log('handleRoomConnected called', { room, isRecordingStarted, session });
    if (isRecordingStarted || !session ) {
      console.log('Skipping recording start due to existing recording, missing session, or pending redirect');
      return;
    }
    
    try {
      setIsRecordingStarted(true);
      setRoom(room);
      const roomName = generateRoomName(session.id);
      console.log('Fetch /api/livekit/recording - Room state set', roomName, room, session);
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, action: 'start', session }),
      });
      if (!response.ok) {
        throw new Error('Failed to start recording');
      }
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Error starting recording:', error);
      setIsRecordingStarted(false);
    }
  }, [session, isRecordingStarted]);

  const handleRoomDisconnected = useCallback(async () => {
    console.log('Room disconnected, stopping recording');
    setIsProcessing(true);
    setProcessingStatus("Stopping conversation...");
    try {
      // Stop the recording
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session!.id), action: 'stop' }),
      });

      setProcessingStatus("Saving final transcript...");
      // Save the final transcript
      await saveTranscript(true);

      setProcessingStatus("Waiting for audio processing...");
      await pollAudioProcessing();

      setProcessingStatus("Session completed. Redirecting...");
      // Wait a moment before redirecting to ensure the user sees the completion message
      setTimeout(() => {
        router.push(`/sessions/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error during session cleanup:', error);
      setProcessingStatus("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [session, id, router, saveTranscript, pollAudioProcessing]);

  useEffect(() => {
    const intervalId = setInterval(() => saveTranscript(), 30000); // Save every 30 seconds

    return () => clearInterval(intervalId);
  }, [transcript, session, saveTranscript]);

  useEffect(() => {
    if (isRoomReady) {
      setSessionStatus('recording');
    }
  }, [isRoomReady]);

  useEffect(() => {
    if (isProcessing) {
      setSessionStatus('uploading');
    }
  }, [isProcessing]);

  const getStatusIcon = () => {
    switch (sessionStatus) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'recording':
        return <Mic className="w-4 h-4" />;
      case 'uploading':
        return <Upload className="w-4 h-4" />;
      case 'completed':
        return <Shield className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (sessionStatus) {
      case 'connecting':
        return 'Connecting';
      case 'recording':
        return 'Recording';
      case 'uploading':
        return 'Uploading';
      case 'completed':
        return 'Completed';
    }
  };

  const handleTranscriptUpdate = useCallback((newTranscriptSegments: TranscriptionSegment[], participant?: Participant) => {
    setTranscript((prev: TranscriptState) => {
      const updatedTranscript = [...prev.transcript];
      
      newTranscriptSegments.forEach(segment => {
        const participantId = participant ? participant.identity : 'ai-muse-v2';
        const existingIndex = updatedTranscript.findIndex(t => t.id === segment.id);
        
        if (existingIndex !== -1) {
          updatedTranscript[existingIndex] = {
            ...updatedTranscript[existingIndex],
            text: segment.text,
            startTime: segment.startTime,
            endTime: segment.endTime,
            language: segment.language,
            isFinal: segment.final
          };
        } else {
          updatedTranscript.push({
            id: segment.id,
            participantId: participantId,
            text: segment.text,
            startTime: segment.startTime,
            endTime: segment.endTime,
            language: segment.language,
            isFinal: segment.final
          });
        }
      });

      return {
        ...prev,
        transcript: updatedTranscript
      };
    });
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!session) {
    return <div>Session not found or you don't have permission to access it.</div>;
  }

  if (!isRoomReady) {
    return <div>Preparing the room...</div>;
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-10 h-full session-record-page">
        <h1 className="text-2xl font-bold mb-4">{session?.title}</h1>
        
        <div className="flex items-center space-x-2 mb-4">
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Shield className="w-4 h-4" />
            <span>Private</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </div>
        
        {token && roomName ? (
          <div
            data-lk-theme="default"
            className="h-full grid content-center"
          >
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              className="grid grid-rows-[2fr_1fr] items-center"
            >
              <RoomComponent onConnected={handleRoomConnected} onDisconnected={handleRoomDisconnected} />
              <SimpleVoiceAssistant onStateChange={() => {}} />
              <div className="relative h-[100px]">
                <div className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center items-center space-x-2">
                  <VoiceAssistantControlBar controls={{ leave: false }} />    
                  <DisconnectButton onClick={handleRoomDisconnected}>
                    <CircleX />
                  </DisconnectButton>
                </div>
              </div>
              <TranscriptionDrawer onTranscriptUpdate={handleTranscriptUpdate} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        ) : (
          <div>Error: Missing token or room name</div>
        )}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
              <p className="text-lg font-semibold text-white">{processingStatus}</p>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}

function SimpleVoiceAssistant({ onStateChange }: { onStateChange: (state: AgentState | null) => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    onStateChange(state);
  }, [onStateChange, state]);

  return (
    <div className="h-[300px] max-w-[90vw] mx-auto">
      <BarVisualizer
        state={state}
        barCount={5}
        trackRef={audioTrack}
        className="agent-visualizer"
        style={{ minHeight: 24 }}
      />
    </div>
  );
}

function RoomComponent({ 
  onConnected, 
  onDisconnected 
}: { 
  onConnected: (room: Room) => void;
  onDisconnected: () => void;
}) {
  const room = useRoomContext();

  useEffect(() => {
    if (!room) {
      console.log('No room available in RoomComponent');
      return;
    }
    console.log('Room available in RoomComponent', room.state);
    
    const handleConnected = () => {
      console.log('Room connected, calling onConnected');
      onConnected(room);
    };

    const handleDisconnected = () => {
      onDisconnected();
    };
    // Call onConnected immediately if the room is already connected
    if (room.state === 'connected') {
      onConnected(room);
    } else {
      room.on('connected', handleConnected);
    }

    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
    };
  }, [room, onConnected, onDisconnected]);

  return null;
}