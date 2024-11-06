'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  LiveKitRoom,
  VoiceAssistantControlBar,
  DisconnectButton,
  RoomAudioRenderer,
  AgentState,
  useMaybeRoomContext
} from '@livekit/components-react';
import { RoomEvent, TranscriptionSegment, Participant } from 'livekit-client';
import "@livekit/components-styles";
import styles from '@/components/recording/visualizer/AgentVisualizer.module.scss';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SimpleVoiceAssistant } from '@/components/recording/visualizer/SimpleVoiceAssistant';
import { useTranscript } from '@/lib/useTranscript';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth, useClerk } from "@clerk/nextjs";
import { topicPlaceholders } from '@/lib/topics';
import { generateRoomName } from '@/lib/utils';
import { AgentVisualizerBands } from '@/components/recording/visualizer/AgentVisualizerBands';
import React from 'react';
import type { Session } from '@/lib/types';
import { InitialControlBar } from './InitialControlBar';
import { TopicInputs } from './TopicInputs';
import { motion } from 'framer-motion';
import { LiveTranscriptOverlay } from '@/components/recording/LiveTranscriptOverlay';
import { Noto_Serif } from 'next/font/google';
import { AgentVariantSelector, type AgentVariant } from './AgentVariantSelector';
import { SessionVisibilitySelector, type VisibilityOption } from './SessionVisibilitySelector';

const notoSerif = Noto_Serif({ subsets: ['latin'] });
type SessionState = {
  token: string;
  roomName: string;
  isRoomReady: boolean;
};

const MAX_TOPICS = 3;

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
  
  const recordingStartedRef = useRef(false);
  const hasAttemptedRecording = useRef(false);

  const [sparkleClicked, setSparkleClicked] = useState<number | null>(null);

  const [buttonJiggle, setButtonJiggle] = useState(false);
  const [visualizerPulse, setVisualizerPulse] = useState(false);

  const [endingSession, setEndingSession] = useState(false);
  const [endingStatus, setEndingStatus] = useState('');

  const [agentVariant, setAgentVariant] = useState<AgentVariant>('calm');

  const [visibility, setVisibility] = useState<VisibilityOption>('public');

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
          title: `New Session ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`,
          topics,
          agentVariant,
          isPublic: visibility === 'public'
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
  }, [inputs, isSignedIn, isLoaded, openSignIn, agentVariant, visibility]);

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

    setEndingSession(true);
    try {
      setEndingStatus('Stopping recording...');
      await fetch('/api/livekit/recording', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomName: generateRoomName(sessionId), 
          action: 'stop' 
        }),
      });

      setEndingStatus('Saving transcript...');
      const session: Partial<Session> = { id: sessionId };
      await saveTranscript(session as Session, true);

      // Trigger post-processing in the background
      fetch(`/api/sessions/${sessionId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(error => {
        // Log error but don't block on it
        console.error('Error triggering post-processing:', error);
      });

      setEndingStatus('Session saved! Redirecting...');
      router.push(`/sessions/${sessionId}`);
    } catch (error) {
      console.error('Error ending session:', error);
      setEndingStatus('Error ending session. Please try again.');
      setTimeout(() => setEndingSession(false), 3000);
    }
  }, [sessionId, router, saveTranscript]);

  const RoomComponent = () => {
    const room = useMaybeRoomContext();

    useEffect(() => {
      if (!room) return;

      const onConnected = () => handleSessionStart(sessionState.roomName);
      const onDisconnected = () => handleSessionEnd();
      const onTranscriptionReceived = (segments: TranscriptionSegment[], participant?: Participant) => {
        console.log('Room received transcription:', segments, 'from participant:', participant);
        if (segments.length > 0) {
          updateTranscript(segments, participant || room.localParticipant);
        }
      };

      room.on(RoomEvent.Connected, onConnected);
      room.on(RoomEvent.Disconnected, onDisconnected);
      room.on(RoomEvent.TranscriptionReceived, onTranscriptionReceived);

      return () => {
        room.off(RoomEvent.Connected, onConnected);
        room.off(RoomEvent.Disconnected, onDisconnected);
        room.off(RoomEvent.TranscriptionReceived, onTranscriptionReceived);
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
        {endingSession && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4 max-w-md mx-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-200 mb-2">
                  Ending Session
                </h3>
                <p className="text-slate-400">
                  {endingStatus}
                </p>
              </div>
            </div>
          </div>
        )}

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
              <div className="pt-12 flex-1 relative">
                <div className="relative h-[360px] w-[360px] mx-auto z-0">
                  <SimpleVoiceAssistant 
                    onStateChange={handleAgentStateChange}
                  />
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-md p-2">
                  <VoiceAssistantControlBar>
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
              <div className="pt-12 flex-1">
                <motion.div 
                  className="relative h-[360px] w-[360px] mx-auto cursor-pointer"
                  onClick={handleVisualizerClick}
                  animate={visualizerPulse ? {
                    scale: [1, 0.9, 1],
                    transition: { duration: 0.25 }
                  } : {}}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={styles['audio-band-visualizer']}>
                      <AgentVisualizerBands
                        volumeBands={[0, 0, 0, 0, 0]}
                        highlightedIndices={[]}
                        minHeight={20}
                        maxHeight={100}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="flex flex-col items-center gap-4">
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

                  <div className="flex gap-2">
                    <AgentVariantSelector
                      selectedVariant={agentVariant}
                      onVariantChange={setAgentVariant}
                    />
                    <SessionVisibilitySelector
                      selectedVisibility={visibility}
                      onVisibilityChange={setVisibility}
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
              </div>
            </>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
} 