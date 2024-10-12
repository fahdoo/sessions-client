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
import { generateRoomName } from '@/lib/livekit';
import { CircleX } from 'lucide-react';
import { Room } from 'livekit-client';
import { TranscriptionDrawer } from '@/components/session/transcription-drawer';
import { Badge } from '@/components/ui/badge';

export default function SessionRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // Use object state instead of individual states
  const [sessionState, setSessionState] = useState({
    token: '',  // Change this from null to an empty string
    roomName: '',
    session: null as Session | null,
    isRoomReady: false,
    isLoading: true,
    shouldRedirect: false
  });

  // Destructure the state for easier use in the component
  const { token, roomName, session, isRoomReady, isLoading, shouldRedirect } = sessionState;

  // Other state declarations that are being used with their setters
  const [transcript, setTranscript] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const isCleaningUp = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'connecting' | 'recording' | 'uploading' | 'completed'>('connecting');

  // Use this effect to set up the initial state and check for existing audio_url
  useEffect(() => {
    async function setupSession() {
      try {
        console.log('Fetching session data');
        const sessionResponse = await fetch(`/api/sessions/${id}`);
        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json();
          throw new Error(`Failed to fetch session: ${errorData.error || sessionResponse.statusText}`);
        }
        const sessionData = await sessionResponse.json();
        
        // Check if the session already has an audio_url or transcript_url
        if (sessionData.audio_url || sessionData.transcript_url) {
          console.log('Session already has an audio_url or transcript_url, setting redirect flag...');
          setSessionState(prevState => ({
            ...prevState,
            shouldRedirect: true,
            isLoading: false
          }));
          return;
        }
        
        console.log('Fetching LiveKit token');
        const tokenResponse = await fetch(`/api/livekit/get-token?sessionId=${id}`);
        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(`Failed to get LiveKit token: ${errorData.error || tokenResponse.statusText}`);
        }
        const tokenData = await tokenResponse.json();
        
        if (!tokenData.token || typeof tokenData.token !== 'string') {
          throw new Error('Invalid token received from server');
        }

        console.log('Received token:', tokenData.token);

        setSessionState(prevState => ({
          ...prevState,
          token: tokenData.token,
          roomName: generateRoomName(sessionData.id),
          session: sessionData,
          isRoomReady: true,
          isLoading: false
        }));
      } catch (error) {
        console.error('Error setting up session:', error);
        setSessionState(prevState => ({ ...prevState, isLoading: false }));
        // You might want to set an error state here and display it to the user
      }
    }

    setupSession();
  }, [id]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push(`/sessions/${id}`);
    }
  }, [shouldRedirect, id, router]);

  // 1. Define saveTranscript first
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

  // 2. Define pollAudioProcessing next
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

  // 3. Now define cleanupSession, which uses saveTranscript
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
    console.log('Room connected, starting recording');
    setRoom(room);
    if (!session) {
      console.error('No session data available');
      return;
    }
    try {
      const roomName = generateRoomName(session.id);
      console.log('Generated room name:', roomName);
      // session is passed in here so we can check if it already has a recording
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, action: 'start', session }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Recording start error:', errorData);
        throw new Error(`Failed to start recording: ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      console.log('Recording started:', data);
    } catch (error) {
      console.error('Error starting recording:', error);
      // You might want to show an error message to the user here
    }
  }, [session]);

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
      // Poll for audio processing completion
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (shouldRedirect) {
    return <div>Redirecting...</div>;
  }

  if (!session) {
    return <div>Session not found or you don't have permission to access it.</div>;
  }

  if (!isRoomReady) {
    return <div>Preparing the room...</div>;
  }

  return (
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
            token={token}  // This should now be a string
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
            <TranscriptionDrawer onTranscriptUpdate={(newTranscript) => setTranscript(newTranscript)} />
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
    if (!room) return;
    // Set up a listener for the 'connected' event
    const handleConnected = () => {
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