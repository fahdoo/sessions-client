import { useEffect, useRef, useState, useCallback } from 'react';
import { AudiogramVisualizerProps } from './types';
import { TranscriptSegment } from '@/lib/types';
import { AudiogramHeader } from './AudiogramHeader';
import { DEFAULT_CONFIG } from './constants';
import styles from './Audiogram.module.scss';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { AudiogramRecorder } from './utils/recording';
import { WaveWrapper } from './visualizers/WaveWrapper';

// Constants for aspect ratio
const ASPECT_RATIO = 9/16;
const MAX_WIDTH = 540;

// Helper function to determine role
const determineRole = (participantId: string): 'agent' | 'user' => {
  return participantId.startsWith('agent') ? 'agent' : 'user';
};

export default function AudiogramVisualizer({ 
  sessionId,
  session,
  visualizationType = 'Cubes',
  config: initialConfig,
  onConfigChange,
}: AudiogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<AudiogramRecorder>();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptData, setTranscriptData] = useState<TranscriptSegment[]>([]);
  const [transcriptPosition, setTranscriptPosition] = useState<'top' | 'middle' | 'bottom'>('middle');
  const [error, setError] = useState<string>();

  const { audioUrl: sessionAudioUrl, transcript, isLoading, error: dataError } = useSessionData(sessionId);

  // Handle data loading error
  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError]);

  // Process transcript data
  const processTranscript = useCallback((transcript: TranscriptSegment[]) => {
    if (!transcript) return;
    
    const processedTranscript = transcript.map(segment => ({
      ...segment,
      role: determineRole(segment.participantId)
    }));
    
    setTranscriptData(processedTranscript);
  }, []);

  useEffect(() => {
    if (transcript) {
      processTranscript(transcript);
    }
  }, [transcript, processTranscript]);

  // Initialize audio
  useEffect(() => {
    if (!audioRef.current || !sessionAudioUrl) {
      return;
    }

    audioRef.current.src = sessionAudioUrl;
    audioRef.current.crossOrigin = 'anonymous';
    
    const handleCanPlay = () => {
      setIsInitialized(true);
    };

    audioRef.current.addEventListener('canplay', handleCanPlay);
    return () => {
      audioRef.current?.removeEventListener('canplay', handleCanPlay);
    };
  }, [sessionAudioUrl]);

  // Update the transcript timing logic
  const updateTranscript = useCallback((time: number) => {
    if (!transcriptData.length) return;

    // Find current segment based on actual timestamps
    const currentSegment = transcriptData.find((segment) => {
      // Use firstReceivedTime and lastReceivedTime for timing
      const startTime = (segment.firstReceivedTime || 0) / 1000;
      const endTime = (segment.lastReceivedTime || startTime + 5) / 1000;

      const isCurrentSegment = time >= startTime && time <= endTime;

      if (isCurrentSegment) {
        console.log('Found segment:', {
          text: segment.text,
          role: determineRole(segment.participantId),
          startTime,
          endTime,
          currentTime: time
        });
      }

      return isCurrentSegment;
    });

    if (currentSegment && currentSegment.text !== currentTranscript) {
      const role = determineRole(currentSegment.participantId);
      console.log('Updating transcript:', {
        text: currentSegment.text,
        role,
        time
      });
      setCurrentTranscript(currentSegment.text);
      setTranscriptPosition(role === 'agent' ? 'bottom' : 'middle');
    }
  }, [transcriptData, currentTranscript]);

  // Add debug logging for transcript data
  useEffect(() => {
    if (transcriptData.length) {
      console.log('Transcript segments:', transcriptData.map(segment => ({
        text: segment.text.substring(0, 30) + '...',
        role: determineRole(segment.participantId),
        startTime: segment.firstReceivedTime ? segment.firstReceivedTime / 1000 : 0,
        endTime: segment.lastReceivedTime ? segment.lastReceivedTime / 1000 : undefined,
        firstReceivedTime: segment.firstReceivedTime,
        lastReceivedTime: segment.lastReceivedTime
      })));
    }
  }, [transcriptData]);

  // Handle canvas sizing
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const width = Math.min(containerWidth, MAX_WIDTH);
    const height = width / ASPECT_RATIO;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      recorderRef.current?.cleanup();
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="max-w-[540px] mx-auto relative">
        <div 
          className={`relative ${styles.visualizer} bg-slate-900 overflow-hidden rounded-2xl`}
          style={{ aspectRatio: '9/16' }}
        >
          {/* Background */}
          {(initialConfig.backgroundImage || session.user?.avatar) && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${initialConfig.backgroundImage || session.user?.avatar})`,
                filter: 'blur(20px) brightness(0.5)'
              }}
            />
          )}

          {/* Content */}
          <div className="absolute inset-0 flex flex-col">
            <AudiogramHeader 
              username={session.user?.username || ''} 
              avatarUrl={session.user?.avatar}
            />
            
            {/* Title */}
            <div 
              className="px-4 pb-4"
              style={{
                position: 'absolute',
                top: `${(initialConfig.titlePosition || 0.2) * 100}%`,
                left: 0,
                right: 0,
                transform: 'translateY(-50%)'
              }}
            >
              <h1 
                className="text-white font-bold text-center"
                style={{
                  fontSize: `${initialConfig.titleSize || DEFAULT_CONFIG.titleSize}px`,
                  color: initialConfig.titleColor || DEFAULT_CONFIG.titleColor,
                  opacity: initialConfig.titleOpacity || DEFAULT_CONFIG.titleOpacity,
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {session.title}
              </h1>
            </div>

            {/* Transcript */}
            <div 
              className="absolute inset-x-0 px-6 transition-all duration-300"
              style={{
                top: `${(initialConfig.transcriptPosition || 0.5) * 100}%`,
                transform: 'translateY(-50%)'
              }}
            >
              <div 
                className="text-white text-center max-w-full"
                style={{
                  fontSize: `${initialConfig.transcriptSize || DEFAULT_CONFIG.transcriptSize}px`,
                  color: initialConfig.transcriptColor || DEFAULT_CONFIG.transcriptColor,
                  opacity: initialConfig.transcriptOpacity || DEFAULT_CONFIG.transcriptOpacity,
                  display: '-webkit-box',
                  WebkitLineClamp: '3',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {currentTranscript && (
                  <div className={styles['animate-fade-in']}>
                    {currentTranscript}
                  </div>
                )}
              </div>
            </div>

            {/* Visualization */}
            <div 
              className="absolute left-0 right-0 bottom-16" 
              style={{ 
                height: `${(initialConfig.visualizerHeight || DEFAULT_CONFIG.visualizerHeight) * 100}%`,
                opacity: initialConfig.visualizerOpacity || DEFAULT_CONFIG.visualizerOpacity
              }}
            >
              <canvas 
                ref={canvasRef} 
                className="w-full h-full"
              />
              {canvasRef.current && audioRef.current && isInitialized && (
                <WaveWrapper
                  canvas={canvasRef.current}
                  audioElement={audioRef.current}
                  type={visualizationType}
                  barColor={initialConfig.barColor}
                />
              )}
            </div>
          </div>
        </div>
        
        {/* Audio Controls */}
        <div className="mt-4">
          <audio 
            ref={audioRef}
            crossOrigin="anonymous"
            controls
            className="w-full"
            onTimeUpdate={() => {
              if (audioRef.current) {
                updateTranscript(audioRef.current.currentTime);
              }
            }}
            preload="auto"
          />
        </div>
      </div>
    </div>
  );
} 