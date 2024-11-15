'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  LiveKitRoom,
  VoiceAssistantControlBar,
  DisconnectButton,
  RoomAudioRenderer,
  AgentState,
  useMaybeRoomContext,
  useConnectionState
} from '@livekit/components-react';
import { RoomEvent, TranscriptionSegment, Participant, ConnectionState } from 'livekit-client';
import "@livekit/components-styles";
import styles from '@/components/recording/visualizer/AgentVisualizer.module.scss';
import { useRouter } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SimpleVoiceAssistant } from '@/components/recording/visualizer/SimpleVoiceAssistant';
import { useTranscript } from '@/lib/hooks/useTranscript';
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { topicPlaceholders } from '@/lib/topics';
import { generateRoomName } from '@/lib/utils';
import { AgentVisualizerBands } from '@/components/recording/visualizer/AgentVisualizerBands';
import type { Session } from '@/lib/types';
import { InitialControlBar } from './InitialControlBar';
import { TopicInputs } from './TopicInputs';
import { motion } from 'framer-motion';
import { Noto_Serif } from 'next/font/google';
import type { AgentVariant } from './AgentVariantSelector';
import type { VisibilityOption } from './SessionVisibilitySelector';
import type { AgentVoice } from './AgentVoiceSelector';
import { DeviceStatusIndicator } from './DeviceStatusIndicator';
import { TroubleshootingDialog } from './TroubleshootingDialog';
import { useMediaDevices } from '@/lib/hooks/useMediaDevices';
import { SessionOptionsBar } from './SessionOptionsBar';
import { PreRoomDeviceStatus } from './PreRoomDeviceStatus';

const notoSerif = Noto_Serif({ subsets: ['latin'] });
type SessionState = {
  token: string;
  roomName: string;
  isRoomReady: boolean;
};

const MAX_TOPICS = 1;

interface QuickRecordingSessionProps {
  initialTopic?: string;
}

function ConnectionMonitor({ onError }: { onError: (error: boolean) => void }) {
  const connectionState = useConnectionState();
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  useEffect(() => {
    console.log('Connection state changed:', connectionState);
    
    // Track if we've successfully connected
    if (connectionState === ConnectionState.Connected) {
      console.log('Connection successful');
      setHasConnectedOnce(true);
      onError(false);
      return;
    }

    // Only start timeout if we haven't connected yet
    if (!hasConnectedOnce && connectionState === ConnectionState.Connecting) {
      const timeout = setTimeout(() => {
        // Check if we're still in the same connecting state
        if (connectionState === ConnectionState.Connecting) {
          console.log('Initial connection timeout - current state:', connectionState);
          onError(true);
        }
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [connectionState, onError, hasConnectedOnce]);

  return null;
}

export function QuickRecordingSession({ initialTopic }: QuickRecordingSessionProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [inputs, setInputs] = useState<string[]>([initialTopic || '']);
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
  const [agentVoice, setAgentVoice] = useState<AgentVoice>('ash');
  const [visibility, setVisibility] = useState<VisibilityOption>('public');
  const [isMounted, setIsMounted] = useState(false);

  const { user } = useUser();
  const [personalInfo, setPersonalInfo] = useState<string | null>(null);
  const { hasAudioPermission, error } = useMediaDevices();
  const [agentConnectionError, setAgentConnectionError] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedVariant = localStorage.getItem('preferredAgentVariant') as AgentVariant;
    const savedVoice = localStorage.getItem('preferredAgentVoice') as AgentVoice;
    const savedVisibility = localStorage.getItem('preferredVisibility') as VisibilityOption;
    
    if (savedVariant) {
      setAgentVariant(savedVariant);
    }
    if (savedVoice) {
      setAgentVoice(savedVoice);
    }
    if (savedVisibility) {
      setVisibility(savedVisibility);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('preferredAgentVariant', agentVariant);
    }
  }, [agentVariant, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('preferredAgentVoice', agentVoice);
    }
  }, [agentVoice, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('preferredVisibility', visibility);
    }
  }, [visibility, isMounted]);

  const handleInputChange = useCallback((index: number, value: string) => {
    setInputs(prev => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  const handleAgentStateChange = useCallback((state: AgentState | null) => {
    if (state) {
      console.log('Agent state changed:', state);
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
      const pendingTopics = inputs[0].trim();
      if (pendingTopics) {
        localStorage.setItem('pendingTopics', pendingTopics);
      }
      openSignIn();
      return;
    }

    setIsConnecting(true);
    try {
      const topics = inputs[0].trim();

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `New Session ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`,
          topics,
          agentVariant,
          agentVoice,
          isPublic: visibility === 'public'
        }),
      });

      if (!response.ok) throw new Error('Failed to create session');
      const sessionData = await response.json();
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
  }, [inputs, isSignedIn, isLoaded, openSignIn, agentVariant, visibility, agentVoice]);

  useEffect(() => {
    if (isSignedIn) {
      const pendingTopics = localStorage.getItem('pendingTopics');
      if (pendingTopics) {
        setInputs([pendingTopics]);
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

      setEndingStatus('Generating summary and key learnings...');
      // Trigger post-processing in the background
      fetch(`/api/sessions/${sessionId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(error => {
        console.error('Error triggering post-processing:', error);
      });

      setEndingStatus('Finalizing your session...');
      setTimeout(() => {
        setEndingStatus('Session saved! Redirecting...');
        router.push(`/sessions/${sessionId}`, { scroll: false });
      }, 1500);

    } catch (error) {
      console.error('Error ending session:', error);
      setEndingStatus('Error ending session. Please try again.');
      setTimeout(() => setEndingSession(false), 3000);
    }
  }, [sessionId, router, saveTranscript]);

  const RoomComponent = () => {
    const room = useMaybeRoomContext();
    const { checkDevices } = useMediaDevices();

    useEffect(() => {
      if (!room) return;

      const onConnected = async () => {
        // Check microphone permission before starting recording
        const hasPermission = await checkDevices();
        if (hasPermission) {
          handleSessionStart(sessionState.roomName);
        }
      };
      const onDisconnected = () => handleSessionEnd();
      const onTranscriptionReceived = (segments: TranscriptionSegment[], participant?: Participant) => {
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

  // Update random topic function to include animation
  const addRandomTopic = useCallback((index: number) => {
    setSparkleClicked(index);
    const randomTopic = topicPlaceholders[Math.floor(Math.random() * topicPlaceholders.length)];
    handleInputChange(0, randomTopic);
    setTimeout(() => setSparkleClicked(null), 500);
  }, [handleInputChange]);

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

  const handleAgentRetry = async () => {
    setAgentConnectionError(false);
    // Re-initialize the room connection
    const roomName = generateRoomName(sessionId!);
    const tokenResponse = await fetch(`/api/livekit/get-token?sessionId=${sessionId}`);
    const { token } = await tokenResponse.json();
    if (!token) throw new Error('Failed to get token');

    setSessionState({
      token,
      roomName,
      isRoomReady: true,
    });
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col">
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
              <ConnectionMonitor onError={setAgentConnectionError} />
              <div className={`${isSignedIn ? 'pt-18' : ''} flex-1 relative`}>
                <div className="relative h-[360px] w-[360px] mx-auto z-0">
                  <SimpleVoiceAssistant 
                    onStateChange={handleAgentStateChange}
                  />
                </div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="bg-white/80 dark:bg-slate-800/40 backdrop-blur-sm rounded-full shadow-md p-2">
                  <div className="flex items-center justify-center gap-4">
                    {agentConnectionError && (
                      <PreRoomDeviceStatus 
                        onRetry={handleAgentRetry}
                        error="Can't connect to agent service"
                        animate={false}
                      />
                    )}
                    <VoiceAssistantControlBar>
                      <DisconnectButton onClick={handleSessionEnd}>
                        End Session
                      </DisconnectButton>
                    </VoiceAssistantControlBar>
                  </div>
                </div>
              </div>
              <RoomAudioRenderer />
            </LiveKitRoom>
          ) : (
            <>
              <div className={`${isSignedIn ? 'pt-18' : ''} flex-1 relative`}>
                <motion.div 
                  className="relative h-[300px] w-[300px] mx-auto cursor-pointer"
                  onClick={handleVisualizerClick}
                  animate={visualizerPulse ? {
                    scale: [1, 0.9, 1],
                    transition: { duration: 0.25 }
                  } : {}}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`${styles['audio-band-visualizer']} relative`}>
                      <AgentVisualizerBands
                        volumeBands={[0, 0, 0, 0, 0]}
                        highlightedIndices={[]}
                        minHeight={30}
                        maxHeight={120}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="flex flex-col items-center gap-4 container mx-auto">
                  <div className="w-full flex">
                    <TopicInputs
                      inputs={inputs}
                      onInputChange={handleInputChange}
                      maxTopics={MAX_TOPICS}
                      sparkleClicked={sparkleClicked}
                      onSparkleClick={addRandomTopic}
                    />
                  </div>

                  <SessionOptionsBar
                    visibility={visibility}
                    onVisibilityChange={setVisibility}
                    agentVariant={agentVariant}
                    onVariantChange={setAgentVariant}
                    agentVoice={agentVoice}
                    onVoiceChange={setAgentVoice}
                    show={!!isSignedIn}
                  />

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