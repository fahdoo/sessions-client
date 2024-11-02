import { useEffect, useRef, useState, useCallback } from 'react';
import { AudiogramVisualizerProps, VisualizationType, VisualizerConfig } from './types';
import { TranscriptSegment } from '@/lib/types';
import { BarsVisualizer } from './visualizers/BarsVisualizer';
import { WaveVisualizer } from './visualizers/WaveVisualizer';
import { CircularVisualizer } from './visualizers/CircularVisualizer';
import { LineVisualizer } from './visualizers/LineVisualizer';
import { FilledWaveVisualizer } from './visualizers/FilledWaveVisualizer';
import { ParticleVisualizer } from './visualizers/ParticleVisualizer';
import { AudiogramHeader } from './AudiogramHeader';
import { AudiogramControls } from './AudiogramControls';
import { THEME_COLORS, VISUALIZER_CONFIG } from './constants';
import styles from './Audiogram.module.scss';
import { AudiogramToolbar } from './AudiogramToolbar';
import { AgentVisualizerBands } from '../recording/visualizer/AgentVisualizerBands';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { AgentVisualizationWrapper } from './AgentVisualizationWrapper';
import { AudiogramRecorder } from './utils/recording';

// Fix toolbar props
interface ToolbarProps {
  onOpenVisualSettings: () => void;
  onOpenTextSettings: () => void;
  onOpenEffectSettings: () => void;
  onOpenColorSettings: () => void;
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function AudiogramVisualizer({ 
  sessionId,
  session,
  visualizationType = 'bars',
  config: initialConfig,
  onConfigChange,
}: AudiogramVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<AudiogramRecorder>();

  const audioContextRef = useRef<AudioContext>();
  const sourceNodeRef = useRef<MediaElementAudioSourceNode>();
  const analyserRef = useRef<AnalyserNode>();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [isInitialized, setIsInitialized] = useState(false);

  const [currentTranscript, setCurrentTranscript] = useState('');
  const [transcriptData, setTranscriptData] = useState<TranscriptSegment[]>([]);

  const [backgroundImage, setBackgroundImage] = useState<string>(session.user?.avatar || '');

  const [volumeBands, setVolumeBands] = useState<number[]>([]);

  const handleConfigChange = useCallback((newConfig: Partial<VisualizerConfig>) => {
    if (newConfig.backgroundImage) {
      setBackgroundImage(newConfig.backgroundImage);
    }
    
    onConfigChange({
      ...initialConfig,
      ...newConfig
    });
  }, [initialConfig, onConfigChange]);

  const { audioUrl: sessionAudioUrl, transcript, isLoading, error: dataError } = useSessionData(sessionId);

  useEffect(() => {
    if (dataError) {
      setError(dataError);
    }
  }, [dataError]);

  useEffect(() => {
    if (transcript) {
      const sortedTranscript = [...transcript].sort(
        (a, b) => (a.firstReceivedTime ?? 0) - (b.firstReceivedTime ?? 0)
      );
      setTranscriptData(sortedTranscript);
    }
  }, [transcript]);

  const drawVisualization = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dataArray: Uint8Array,
    totalSize: number
  ) => {
    const visualizerProps = {
      ctx,
      canvas,
      dataArray,
      totalSize,
      barColor: initialConfig.barColor,
      position: 'bottom' as const,
      config: initialConfig
    };

    // Convert frequency data to volume bands for agent visualization
    const volumeBands = Array.from(dataArray)
      .slice(0, 32)
      .map(value => value / 255);

    switch (visualizationType) {
      case 'wave':
        WaveVisualizer(visualizerProps);
        break;
      case 'filledWave':
        FilledWaveVisualizer(visualizerProps);
        break;
      case 'circular':
        CircularVisualizer(visualizerProps);
        break;
      case 'line':
        LineVisualizer(visualizerProps);
        break;
      case 'agent':
        // Clear the entire canvas for agent visualization
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const newVolumeBands = Array.from(dataArray)
          .slice(0, 32)
          .map(value => value / 255);
        setVolumeBands(newVolumeBands);
        return newVolumeBands;
      case 'bars':
      default:
        BarsVisualizer(visualizerProps);
        break;
    }
  };

  const startRecording = useCallback(async () => {
    if (!canvasRef.current || !audioRef.current) return;

    try {
      if (!recorderRef.current) {
        recorderRef.current = new AudiogramRecorder(
          canvasRef.current,
          audioRef.current,
          sessionId
        );
      }

      await recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Make sure you have granted necessary permissions.');
    }
  }, [sessionId]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.stopRecording()) {
      setIsRecording(false);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current || !sessionAudioUrl) {
      console.log('Audio ref or URL not ready:', { audioRef: !!audioRef.current, audioUrl: sessionAudioUrl });
      return;
    }

    const initializeAudio = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }

        if (!sourceNodeRef.current) {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!);
          analyserRef.current = audioContextRef.current.createAnalyser();
          sourceNodeRef.current.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          analyserRef.current.fftSize = 256;
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('Error initializing audio:', err);
        setError('Failed to initialize audio visualization');
      }
    };

    const audio = audioRef.current;
    audio.addEventListener('canplaythrough', initializeAudio);
    audio.addEventListener('play', () => {
      audioContextRef.current?.resume();
      setIsPlaying(true);
    });
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      audio.removeEventListener('canplaythrough', initializeAudio);
      audio.removeEventListener('play', () => setIsPlaying(true));
      audio.removeEventListener('pause', () => setIsPlaying(false));
      audio.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, [sessionAudioUrl]);

  useEffect(() => {
    if (!canvasRef.current || !analyserRef.current || !isInitialized) {
      console.log('Visualization not ready:', {
        canvas: !!canvasRef.current,
        analyser: !!analyserRef.current,
        initialized: isInitialized,
        isPlaying
      });
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    let animationFrame: number;
    
    const draw = () => {
      if (!isPlaying) return;
      
      animationFrame = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Clear only the visualization area, not the entire canvas
      const bottomThirdStart = canvas.height * 0.66;
      ctx.clearRect(0, bottomThirdStart, canvas.width, canvas.height - bottomThirdStart);
      
      // Draw visualization
      const totalSize = canvas.width / window.devicePixelRatio;
      drawVisualization(ctx, canvas, dataArray, totalSize);
    };

    if (isPlaying) {
      console.log('Starting animation loop');
      draw();
    }

    return () => {
      if (animationFrame) {
        console.log('Cleaning up animation frame');
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, isInitialized, visualizationType, initialConfig.barColor, initialConfig.visualizerHeight]);

  const initializeAudio = useCallback(async () => {
    try {
      console.log('Initializing audio...');
      
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
        console.log('Created new AudioContext');
      }

      if (!audioRef.current) {
        console.log('No audio element found');
        return;
      }

      if (!sourceNodeRef.current) {
        sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        sourceNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        console.log('Audio nodes connected');
      }

      await audioContextRef.current.resume();
      setIsInitialized(true);
      console.log('Audio context initialized and resumed');
      
      if (audioRef.current.paused) {
        await audioRef.current.play();
        console.log('Started audio playback');
      }
      
      setIsPlaying(true);
    } catch (err) {
      console.error('Error initializing audio:', err);
      setError('Failed to initialize audio visualization');
    }
  }, []);

  const handleBackgroundChange = (imageUrl: string) => {
    setBackgroundImage(imageUrl);
  };

  const updateTranscript = useCallback((time: number) => {
    if (!transcriptData.length) return;

    const firstSegment = transcriptData[0];
    const lastSegment = transcriptData[transcriptData.length - 1];
    
    if (!firstSegment?.firstReceivedTime || !lastSegment?.lastReceivedTime) return;
    
    const timeOffset = firstSegment.firstReceivedTime;
    const totalDuration = lastSegment.lastReceivedTime - timeOffset;
    const currentPosition = time / (audioRef.current?.duration || 1);
    const estimatedTime = timeOffset + (totalDuration * currentPosition);

    const currentSegment = transcriptData.find((segment) => {
      const nextSegment = transcriptData[transcriptData.indexOf(segment) + 1];
      return estimatedTime >= (segment.firstReceivedTime || 0) && 
             (!nextSegment || estimatedTime < (nextSegment.firstReceivedTime || 0));
    });

    if (currentSegment) {
      setCurrentTranscript(currentSegment.text);
    }
  }, [transcriptData]);

  useEffect(() => {
    return () => {
      recorderRef.current?.cleanup();
      
      if (sourceNodeRef.current) {
        sourceNodeRef.current.disconnect();
      }
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className={`relative aspect-square ${styles.visualizer} bg-slate-900 overflow-hidden rounded-lg`}>
          {/* Background blur - use config.backgroundImage if available, fallback to avatar */}
          {(initialConfig.backgroundImage || session.user?.avatar) && (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${initialConfig.backgroundImage || session.user?.avatar})`,
                filter: 'blur(20px) brightness(0.5)'
              }}
            />
          )}

          {/* Header and Title Section */}
          <div className="absolute top-0 left-0 right-0">
            {/* Logo and Username */}
            <AudiogramHeader 
              username={session.user?.username || ''} 
              avatarUrl={session.user?.avatar}
            />
            
            {/* Session Title - Now positioned below header */}
            <div className="px-4 pt-16 pb-4">
              <h1 className="text-white text-2xl font-bold text-center">
                {session.title}
              </h1>
            </div>
          </div>

          {/* Transcript Area */}
          <div className="absolute top-32 bottom-32 left-8 right-8 overflow-hidden flex items-center justify-center">
            {currentTranscript && (
              <div 
                className="text-white text-2xl text-center transition-opacity duration-300"
                style={{ 
                  maxHeight: '100%',
                  overflowY: 'auto',
                  display: '-webkit-box',
                  WebkitLineClamp: '6',
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.5'
                }}
              >
                {currentTranscript}
              </div>
            )}
          </div>
          
          {/* Visualization Area */}
          {visualizationType === 'agent' ? (
            <div className="absolute inset-0">
              <AgentVisualizationWrapper 
                volumeBands={volumeBands}
                minHeight={20}
                maxHeight={80}
              />
            </div>
          ) : (
            <canvas 
              ref={canvasRef} 
              className="absolute bottom-0 left-0 right-0 w-full"
              style={{ height: `${(initialConfig.visualizerHeight || 0.15) * 100}%` }}
            />
          )}
        </div>
        
        {/* Audio Controls */}
        <div className="mt-4">
          <audio 
            ref={audioRef}
            src={sessionAudioUrl}
            crossOrigin="anonymous"
            controls
            className="w-full"
            onTimeUpdate={() => {
              if (audioRef.current) {
                updateTranscript(audioRef.current.currentTime);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 