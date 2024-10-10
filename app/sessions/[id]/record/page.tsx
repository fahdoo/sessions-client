'use client';

import { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    const fetchSessionAndToken = async () => {
      if (!id || !userId) {
        console.error('Missing id or userId');
        return;
      }

      try {
        // Fetch session details
        const sessionResponse = await fetch(`/api/sessions/${id}`);
        if (!sessionResponse.ok) {
          throw new Error(`Failed to fetch session: ${sessionResponse.statusText}`);
        }
        const sessionData = await sessionResponse.json();
        console.log('Session data:', sessionData);
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
      }
    };

    fetchSessionAndToken();
  }, [id, userId]);

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
    if (!session) return;
    try {
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: generateRoomName(session.id), action: 'stop' }),
      });
      if (!response.ok) {
        throw new Error('Failed to stop recording');
      }
      const data = await response.json();
      console.log('Recording stopped:', data);
      // Redirect to session view page
      router.push(`/sessions/${id}`);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  }, [session, id, router]);

  useEffect(() => {
    const saveTranscript = async () => {
      if (!transcript || !session) return;

      const response = await fetch(`/api/sessions/${session.id}/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });

      if (!response.ok) {
        console.error('Failed to save transcript');
      }
    };

    const intervalId = setInterval(saveTranscript, 30000); // Save every 30 seconds

    return () => clearInterval(intervalId);
  }, [transcript, session]);

  if (!isRoomReady) {
    return <div>Preparing the room...</div>;
  }

  return (
    <div className="container mx-auto px-10 h-full session-record-page">
      <h1 className="text-2xl font-bold mb-4">{session?.title}</h1>
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