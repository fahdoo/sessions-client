'use client';

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  AudioConference,
  useParticipants,
  useRoomContext,
  ControlBar,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from '@livekit/components-react';
import "@livekit/components-styles";
import { Button } from '@/components/ui/button';
import { Session } from '@/lib/types';
import { useParams } from 'next/navigation';
import { useVoiceAssistant } from '@livekit/components-react';
import { useAuth } from '@clerk/nextjs';
import { generateRoomName } from '@/lib/utils';
import { CircleX } from 'lucide-react';

export default function SessionRecordPage() {
  const { id } = useParams();
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const { userId } = useAuth();

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

  const startInterview = async () => {
    if (!session || !roomName) {
      console.error('Cannot start interview: session or roomName is missing');
      return;
    }
    setIsInterviewStarted(true);
  };

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
            connect={isInterviewStarted}
            audio={true}
            video={false}
            className="grid grid-rows-[2fr_1fr] items-center"
            >
                <SimpleVoiceAssistant onStateChange={setAgentState}/>
                <div className="relative h-[100px]">
                    {isInterviewStarted && (
                    <div className="flex h-8 absolute left-1/2 -translate-x-1/2 justify-center">
                        <VoiceAssistantControlBar controls={{ leave: false }} />    
                        <DisconnectButton>
                          <CircleX />
                        </DisconnectButton>
                    </div>
                    )}
                    {!isInterviewStarted && (
                    <Button 
                        onClick={startInterview} 
                        className="uppercase absolute left-1/2 -translate-x-1/2">
                        Start Conversation
                    </Button>
                    )}
                </div>
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