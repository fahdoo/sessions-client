'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader, Loader2, Shield, WifiOff } from 'lucide-react';
import {
  LiveKitRoom,
  VoiceAssistantControlBar,
  DisconnectButton,
  RoomAudioRenderer,
  AgentState,
  useMaybeRoomContext
} from '@livekit/components-react';
import "@livekit/components-styles";
import { Session } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { generateRoomName, isAIAgent, aiAgentNameMapping } from '@/lib/utils';
import { TranscriptionSegment, Participant, RoomEvent } from 'livekit-client';
import { Badge } from '@/components/ui/badge';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SimpleVoiceAssistant } from '@/components/session/SimpleVoiceAssistant';
import { useTranscript } from '@/lib/useTranscript';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TranscriptionDrawer } from '@/components/session/transcription-drawer';

type SessionState = {
  token: string;
  roomName: string;
  session: Session | null;
  isRoomReady: boolean;
  isLoading: boolean;
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

  const { transcript, fullTranscript, updateTranscript, saveTranscript } = useTranscript(id as string);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [sessionTitle, setSessionTitle] = useState<string>('');

  const recordingStartedRef = useRef(false);
  const hasAttemptedRecording = useRef(false);

  const [latestTranscripts, setLatestTranscripts] = useState<TranscriptionSegment[]>([]);

  useEffect(() => {
    async function setupSession() {
      try {
        console.log('Fetching session data');
        const response = await fetch(`/api/sessions/${id}`);
        if (!response.ok) throw new Error('Failed to fetch session');
        const sessionData: Session = await response.json();
        
        if (sessionData.audioUrl || sessionData.transcriptUrl) {
          console.log('Session already has audio or transcript, redirecting');
          router.push(`/sessions/${id}`);
          return;
        }

        console.log('Session is new, continuing with recording setup');
        const tokenResponse = await fetch(`/api/livekit/get-token?sessionId=${id}`);
        const { token } = await tokenResponse.json();
        if (!token || typeof token !== 'string') throw new Error('Invalid token received from server');

        setSessionState(prev => ({
          ...prev,
          token,
          roomName: generateRoomName(sessionData.id),
          session: sessionData,
          isRoomReady: true,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }

    setupSession();
  }, [id, router]);

  const handleSessionStart = useCallback(async () => {
    if (recordingStartedRef.current || hasAttemptedRecording.current) {
      console.log('Recording already started or attempted, skipping');
      return;
    }

    hasAttemptedRecording.current = true;

    try {
      const roomName = generateRoomName(session!.id);
      console.log('Starting recording for room:', roomName);
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, action: 'start', session }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to start recording: ${errorData.error}`);
      }

      const data = await response.json();
      console.log(data.message === 'Recording already in progress' ? 'Recording was already in progress' : 'Recording started successfully');
      
      recordingStartedRef.current = true;
      setAgentState('listening');
    } catch (error) {
      console.error('Error starting recording:', error);
    } finally {
      hasAttemptedRecording.current = false;
    }
  }, [session]);

  const handleSessionEnd = useCallback(async () => {
    console.log('Ending session, stopping recording');
    setIsProcessing(true);
    setProcessingStatus("Stopping conversation...");
    try {
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session!.id), action: 'stop' }),
      });

      setProcessingStatus("Saving final transcript...");
      await saveTranscript(session!, true);

      setProcessingStatus("Session completed. Redirecting...");
      setTimeout(() => router.push(`/sessions/${id}`), 2000);
    } catch (error) {
      console.error('Error during session cleanup:', error);
      setProcessingStatus("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [session, id, router, saveTranscript]);

  const handleRoomEvent = useCallback((event: RoomEvent.Connected | RoomEvent.Disconnected) => {
    console.log(`Room ${event}`);
    if (event === RoomEvent.Connected && !recordingStartedRef.current && !hasAttemptedRecording.current) {
      handleSessionStart();
    } else if (event === RoomEvent.Disconnected) {
      handleSessionEnd();
    }
  }, [handleSessionStart]);


  const handleTranscriptUpdate = useCallback((newTranscriptSegments: TranscriptionSegment[], participant?: Participant) => {
    console.log('Received new transcript segments:', newTranscriptSegments);
    updateTranscript(newTranscriptSegments, participant);
    setLatestTranscripts(prev => {
      const updated = [...prev, ...newTranscriptSegments].slice(-2);
      return updated;
    });
  }, [updateTranscript]);

  const RoomComponent = () => {
    const room = useMaybeRoomContext();

    useEffect(() => {
      if (!room) {
        console.log('No room available in RoomComponent');
        return;
      }
      console.log('Room available in RoomComponent', room.state);

      const onConnected = () => handleRoomEvent(RoomEvent.Connected);
      const onDisconnected = () => handleRoomEvent(RoomEvent.Disconnected);

      room.on(RoomEvent.Connected, onConnected);
      room.on(RoomEvent.Disconnected, onDisconnected);
      room.on(RoomEvent.TranscriptionReceived, handleTranscriptUpdate);

      return () => {
        room.off(RoomEvent.Connected, onConnected);
        room.off(RoomEvent.Disconnected, onDisconnected);
        room.off(RoomEvent.TranscriptionReceived, handleTranscriptUpdate);
      };
    }, [room]);

    console.log('RoomComponent function called');

    return null;
  };

  const getStatusIcon = () => {
    switch (agentState) {
      case 'connecting':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'listening':
        return <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />;
      case 'speaking':
        return <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />;
      case 'thinking':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'disconnected':
        return <WifiOff className="w-4 h-4" />;
      case 'initializing':
        return <Loader className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (agentState) {
      case 'connecting':
        return 'Connecting...';
      case 'listening':
        return 'Listening';
      case 'speaking':
        return 'Speaking';
      case 'thinking':
        return 'Thinking...';
      case 'disconnected':
        return 'Disconnected';
      case 'initializing':
        return 'Initializing';
      default:
        return 'Unknown';
    }
  };

  const handleAgentStateChange = useCallback((newState: AgentState | null) => {
    if (newState !== null) {
      setAgentState(newState);
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup logic
      if (recordingStartedRef.current) {
        handleSessionEnd();
      }
    };
  }, [handleSessionEnd]);

  console.log('SessionRecordPage rendering', { token, roomName, session, isRoomReady, isLoading });

  if (isLoading) return <div>Loading...</div>;
  if (!session) return <div>Session not found or you don't have permission to access it.</div>;
  if (!isRoomReady) return <div>Preparing the room...</div>;

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-10 h-full session-record-page">
        <h1 className="text-2xl font-bold mb-4">
          {sessionTitle || session?.title || 'Untitled Session'}
        </h1>
        
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
          <div data-lk-theme="default" className="h-full grid content-center">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              className="grid grid-rows-[2fr_auto_1fr] items-center"
            >
              <RoomComponent />
              <SimpleVoiceAssistant onStateChange={handleAgentStateChange} />
              <div className="relative h-[100px]">
                <div className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center items-center space-x-2">
                  <VoiceAssistantControlBar controls={{ leave: false }} />    
                  <DisconnectButton>End session</DisconnectButton>
                </div>
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
            <div className="fixed bottom-4 right-4">
              <TranscriptionDrawer 
                currentTitle={sessionTitle || session?.title || 'Untitled Session'}
                transcript={transcript.transcript}
                userName={session?.user?.firstName || 'User'}
                userAvatar={session?.user?.avatar}
              />
            </div>
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
