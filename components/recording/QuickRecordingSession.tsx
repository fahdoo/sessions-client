'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import {
  LiveKitRoom,
  VoiceAssistantControlBar,
  DisconnectButton,
  RoomAudioRenderer,
  AgentState,
  useMaybeRoomContext
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import "@livekit/components-styles";
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SimpleVoiceAssistant } from '@/components/recording/visualizer/SimpleVoiceAssistant';
import { useTranscript } from '@/lib/useTranscript';
import { TranscriptionDrawer } from '@/components/transcription/TranscriptionDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useClerk } from "@clerk/nextjs";
import { topicPlaceholders } from '@/lib/topics';
import { generateRoomName } from '@/lib/utils';
import { AgentVisualizerBands } from '@/components/recording/visualizer/AgentVisualizerBands';
import styles from '@/components/recording/visualizer/AgentVisualizer.module.scss';
import React from 'react';
import type { Session } from '@/lib/types';
import { InitialControlBar } from './InitialControlBar';
import { TopicInputs } from './TopicInputs';
import { motion } from 'framer-motion';

type SessionState = {
  token: string;
  roomName: string;
  isRoomReady: boolean;
};

const MAX_TOPICS = 5;

export function QuickRecordingSession() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [inputs, setInputs] = useState<string[]>(['']);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { transcript, updateTranscript, saveTranscript } = useTranscript(sessionId || '');
  const [sessionState, setSessionState] = useState<SessionState>({
    token: '',
    roomName: '',
    isRoomReady: false,
  });
  
  // Visualization state
  const [volumeBands] = useState<number[]>([0.2, 0.15, 0.1, 0.15, 0.2]);
  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);
  const updateInterval = 200;

  // Remove the animation effect since we want static visualization in standby
  useEffect(() => {
    if (animationFrameId.current !== null) {
      cancelAnimationFrame(animationFrameId.current);
    }
  }, []);

  const recordingStartedRef = useRef(false);
  const hasAttemptedRecording = useRef(false);

  const [sparkleClicked, setSparkleClicked] = useState<number | null>(null);

  const [buttonJiggle, setButtonJiggle] = useState(false);
  const [visualizerPulse, setVisualizerPulse] = useState(false);

  const handleInputChange = useCallback((index: number, value: string) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      
      if (index === newInputs.length - 1 && value.trim() !== '' && newInputs.length < MAX_TOPICS) {
        newInputs.push('');
      }
      
      if (value.trim() === '' && index !== newInputs.length - 1) {
        newInputs.splice(index, 1);
      }
      
      return newInputs;
    });
  }, []);

  const handleAgentStateChange = useCallback((state: AgentState | null) => {
    if (state) {
      setAgentState(state);
    }
  }, []);

  const handleSessionStart = useCallback(async (roomName: string) => {
    if (recordingStartedRef.current || hasAttemptedRecording.current) {
      console.log('Recording already started or attempted, skipping');
      return;
    }

    hasAttemptedRecording.current = true;

    try {
      console.log('Starting recording for room:', roomName);
      const response = await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName, action: 'start' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to start recording: ${errorData.error}`);
      }

      recordingStartedRef.current = true;
      setAgentState('listening');
    } catch (error) {
      console.error('Error starting recording:', error);
    } finally {
      hasAttemptedRecording.current = false;
    }
  }, []);

  const { isSignedIn, isLoaded } = useAuth();
  const { openSignIn } = useClerk();

  const handleConnect = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const pendingTopics = inputs.filter(input => input.trim()).join('\n');
      if (pendingTopics) {
        localStorage.setItem('pendingTopics', pendingTopics);
      }
      openSignIn();
      return;
    }

    setIsConnecting(true);
    try {
      const topics = inputs
        .filter(input => input.trim())
        .join('\n');

      const sessionResponse = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `New Session ${new Date().toLocaleString()}`,
          topics
        }),
      });

      if (!sessionResponse.ok) throw new Error('Failed to create session');
      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.id);

      const tokenResponse = await fetch(`/api/livekit/get-token?sessionId=${sessionData.id}`);
      const { token } = await tokenResponse.json();
      if (!token) throw new Error('Failed to get token');

      const roomName = generateRoomName(sessionData.id);
      setSessionState({
        token,
        roomName,
        isRoomReady: true,
      });

    } catch (error) {
      console.error('Connection error:', error);
      alert('Failed to start session. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  }, [inputs, isSignedIn, isLoaded, openSignIn]);

  useEffect(() => {
    if (isSignedIn) {
      const pendingTopics = localStorage.getItem('pendingTopics');
      if (pendingTopics) {
        setInputs(pendingTopics.split('\n'));
        localStorage.removeItem('pendingTopics');
      }
    }
  }, [isSignedIn]);

  const handleSessionEnd = useCallback(async () => {
    if (!sessionId) return;

    try {
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomName: generateRoomName(sessionId), 
          action: 'stop' 
        }),
      });

      const session: Partial<Session> = { id: sessionId };
      await saveTranscript(session as Session, true);
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [sessionId, router, saveTranscript]);

  const RoomComponent = () => {
    const room = useMaybeRoomContext();

    useEffect(() => {
      if (!room) return;

      const onConnected = () => handleSessionStart(sessionState.roomName);
      const onDisconnected = () => handleSessionEnd();

      room.on(RoomEvent.Connected, onConnected);
      room.on(RoomEvent.Disconnected, onDisconnected);

      return () => {
        room.off(RoomEvent.Connected, onConnected);
        room.off(RoomEvent.Disconnected, onDisconnected);
      };
    }, [room]);

    return null;
  };

  // Remove rotating placeholders, use a single generic one
  const defaultPlaceholder = "What do you want to discuss about your life...";

  // Update random topic function to include animation
  const addRandomTopic = useCallback((index: number) => {
    setSparkleClicked(index);
    const randomTopic = topicPlaceholders[Math.floor(Math.random() * topicPlaceholders.length)];
    handleInputChange(index, randomTopic);
    setTimeout(() => setSparkleClicked(null), 500);
  }, [handleInputChange]);

  // Update the input rendering
  const renderInput = (index: number, input: string) => (
    <div key={index} className="relative flex items-center w-[280px]">
      <Input
        value={input}
        onChange={(e) => handleInputChange(index, e.target.value)}
        className="text-sm bg-white/5 dark:bg-slate-800/20 backdrop-blur-sm rounded-full px-4 pr-10 h-10 border-slate-600/50 [&:not(:placeholder-shown)]:text-sm [&::placeholder]:text-sm text-slate-300"
        placeholder={index === 0 ? defaultPlaceholder : "Add another topic..."}
      />
      {(inputs.length < MAX_TOPICS || index < inputs.length - 1) && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 hover:bg-transparent p-1"
          onClick={() => addRandomTopic(index)}
          title="Get a topic suggestion"
        >
          <Sparkles 
            className={`h-4 w-4 transition-all duration-300 ${
              sparkleClicked === index 
                ? 'text-blue-400 scale-125 opacity-100' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          />
        </Button>
      )}
    </div>
  );

  const handleVisualizerClick = () => {
    if (!sessionState.isRoomReady) {
      setButtonJiggle(true);
      setVisualizerPulse(true);
      // Reset animations
      setTimeout(() => {
        setButtonJiggle(false);
        setVisualizerPulse(false);
      }, 500);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col bg-slate-900">
        <div data-lk-theme="default" className="flex-1 flex flex-col relative">
          {sessionState.isRoomReady ? (
            <LiveKitRoom
              token={sessionState.token}
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              connect={true}
              audio={true}
              video={false}
              className="flex-1 flex flex-col"
            >
              <RoomComponent />
              <div className="pt-12 flex-1">
                <div className="relative h-[360px] w-[360px] mx-auto">
                  <SimpleVoiceAssistant onStateChange={handleAgentStateChange} />
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-md p-2">
                  <VoiceAssistantControlBar>
                    <TranscriptionDrawer
                      currentTitle="New Session"
                      transcript={transcript.transcript}
                      userName="User"
                      userAvatar=""
                    />
                    <DisconnectButton onClick={handleSessionEnd}>
                      End Session
                    </DisconnectButton>
                  </VoiceAssistantControlBar>
                </div>
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <>
              <div className="pt-24 flex-1">
                <motion.div 
                  className="relative h-[360px] w-[360px] mx-auto cursor-pointer"
                  onClick={handleVisualizerClick}
                  animate={visualizerPulse ? {
                    scale: [1, 0.98, 1],
                    transition: { duration: 0.5 }
                  } : {}}
                >
                  <div className={`${styles['audio-band-visualizer']} absolute inset-0 flex items-center justify-center`}>
                    <AgentVisualizerBands
                      volumeBands={volumeBands}
                      highlightedIndices={[]}
                      minHeight={20}
                      maxHeight={100}
                    />
                  </div>
                </motion.div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="flex justify-center mb-2">
                  <TopicInputs
                    inputs={inputs}
                    onInputChange={handleInputChange}
                    maxTopics={MAX_TOPICS}
                    sparkleClicked={sparkleClicked}
                    onSparkleClick={addRandomTopic}
                    defaultPlaceholder="What do you want to discuss about your life..."
                  />
                </div>
                
                <motion.div 
                  animate={buttonJiggle ? { 
                    x: [0, -5, 5, -5, 5, 0],
                    transition: { duration: 0.5 }
                  } : {}}
                  className="backdrop-blur-sm rounded-full p-2"
                >
                  <InitialControlBar 
                    onConnect={handleConnect}
                    isConnecting={isConnecting}
                  />
                </motion.div>
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
} 