'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, Upload, Mic, Shield } from 'lucide-react';
import {
  LiveKitRoom,
  AudioConference,
  useRoomContext,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
  useVoiceAssistant, 
} from '@livekit/components-react';
import "@livekit/components-styles";
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { generateRoomName } from '@/lib/utils';
import { CircleX } from 'lucide-react';
import { Room } from 'livekit-client';
import { TranscriptionDrawer } from '@/components/session/transcription-drawer';
import { Badge } from '@/components/ui/badge';

export default function SessionRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const { userId } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const isCleaningUp = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'connecting' | 'recording' | 'uploading' | 'completed'>('connecting');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndToken = async () => {
      if (!id || !userId) {
        console.error('Missing id or userId');
        return;
      }

      try {
        setIsLoading(true);
        // Fetch session details
        const sessionResponse = await fetch(`/api/sessions/${id}`);
        if (!sessionResponse.ok) {
          throw new Error(`Failed to fetch session: ${sessionResponse.statusText}`);
        }
        const sessionData = await sessionResponse.json();
        console.log('Session data:', sessionData);

        // Check if the session already has a recording
        if (sessionData.audioUrl) {
          console.log('Session already has a recording. Redirecting to session view.');
          router.push(`/sessions/${id}`);
          return;
        }

        setSession(sessionData);

        const roomName = generateRoomName(sessionData.id);
        setRoomName(roomName);

        // Fetch LiveKit token
        const tokenUrl = `/api/livekit/get-token?roomName=${roomName}&username=${userId}`;
        console.log('Fetching token from:', tokenUrl);
        const tokenResponse = await fetch(tokenUrl);
        if (!tokenResponse.ok) {
          throw new Error(`Failed to fetch token: ${tokenResponse.statusText}`);
        }
        const { token } = await tokenResponse.json();
        if (typeof token !== 'string') {
          throw new Error('Received token is not a string');
        }
        setToken(token);

        setIsRoomReady(true);
      } catch (error) {
        console.error('Error in fetchSessionAndToken:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionAndToken();
  }, [id, userId, router]);

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
  }, [session, room]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      cleanupSession();
      event.preventDefault();
      event.returnValue = '';
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
    if (!session) return;
    try {
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session.id), action: 'start' }),
      });
      if (!response.ok) {
        throw new Error('Failed to start recording');
      }
      const data = await response.json();
      console.log('Recording started:', data);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [session]);

  const handleRoomDisconnected = useCallback(async () => {
    console.log('Room disconnected, stopping recording');
    setIsProcessing(true);
    setProcessingStatus('Stopping conversation...');
    try {
      // Stop the recording
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session!.id), action: 'stop' }),
      });

      setProcessingStatus('Saving final transcript...');
      // Save the final transcript
      await saveTranscript(true);

      setProcessingStatus('Waiting for audio processing...');
      // Poll for audio processing completion
      await pollAudioProcessing();

      setProcessingStatus('Session completed. Redirecting...');
      // Wait a moment before redirecting to ensure the user sees the completion message
      setTimeout(() => {
        router.push(`/sessions/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error during session cleanup:', error);
      setProcessingStatus('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [session, id, router]);

  const pollAudioProcessing = async () => {
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
  };

  const saveTranscript = async (isCompleted = false) => {
    if (!transcript || !session) return;

    const response = await fetch(`/api/sessions/${session.id}/transcript`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, isCompleted }),
    });

    if (!response.ok) {
      console.error('Failed to save transcript');
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => saveTranscript(), 30000); // Save every 30 seconds

    return () => clearInterval(intervalId);
  }, [transcript, session]);

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
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            connect={true}
            audio={true}
            video={false}
            className="grid grid-rows-[2fr_1fr] items-center"
          >
            <RoomComponent onConnected={handleRoomConnected} onDisconnected={handleRoomDisconnected} />
            <SimpleVoiceAssistant onStateChange={setAgentState} />
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
      {isStoppingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
            <p className="text-lg font-semibold text-white">Session completed, redirecting...</p>
          </div>
        </div>
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

function SimpleVoiceAssistant(props: { onStateChange: (state: AgentState) => void }) {
  const { state, audioTrack } = useVoiceAssistant();

  useEffect(() => {
    props.onStateChange(state);
  }, [props, state]);

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