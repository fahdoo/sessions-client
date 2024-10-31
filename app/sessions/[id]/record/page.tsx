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
import { generateRoomName } from '@/lib/utils';
import { TranscriptionSegment, Participant, RoomEvent } from 'livekit-client';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SimpleVoiceAssistant } from '@/components/recording/visualizer/SimpleVoiceAssistant';
import { useTranscript } from '@/lib/useTranscript';
import { TranscriptionDrawer } from '@/components/transcription/TranscriptionDrawer';
import LoadingIndicator from '@/components/LoadingIndicator';

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

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <LoadingIndicator message="Preparing your recording session..." size={32} />
    </div>
  );

  if (!session) return (
    <div className="h-full flex items-center justify-center">
      <div className="flex items-center gap-2 text-red-500">
        <Shield className="h-6 w-6" />
        <p>Session not found or you don't have permission to access it.</p>
      </div>
    </div>
  );

  if (!isRoomReady) return (
    <div className="h-full flex items-center justify-center">
      <LoadingIndicator message="Connecting to room..." size={32} />
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="h-full flex flex-col overflow-hidden">
        {token && roomName ? (
          <div data-lk-theme="default" className="flex-1 flex flex-col overflow-hidden">
            <LiveKitRoom
              token={token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              className="flex-1 flex flex-col bg-slate-900 overflow-hidden"
            >
              <RoomComponent />
              <div className="h-[calc(100vh-0px)] flex items-center justify-center -mt-[72px]">
                <div className="relative h-[360px] w-[360px]">
                  <SimpleVoiceAssistant onStateChange={handleAgentStateChange} />
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4">
                <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-md p-2">
                  <VoiceAssistantControlBar>
                    <TranscriptionDrawer
                      currentTitle={sessionTitle || session?.title || 'Untitled Session'}
                      transcript={transcript.transcript}
                      userName={session?.user?.firstName || 'User'}
                      userAvatar={session?.user?.avatar}
                    />
                    <DisconnectButton 
                      onClick={handleSessionEnd}
                    >
                      End Session
                    </DisconnectButton>
                  </VoiceAssistantControlBar>
                </div>
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2 text-red-500">
              <Shield className="h-6 w-6" />
              <p>Error: Missing token or room name</p>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="fixed inset-0 bg-slate-800 bg-opacity-50 p-6 rounded-lg shadow-lg backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-semibold text-white">{processingStatus}</p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
