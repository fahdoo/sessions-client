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
import { THEME_COLORS, VISUALIZER_CONFIG, DEFAULT_CONFIG } from './constants';
import styles from './Audiogram.module.scss';
import { AudiogramToolbar } from './AudiogramToolbar';
import { AgentVisualizerBands } from '../recording/visualizer/AgentVisualizerBands';
import { useSessionData } from '@/lib/hooks/useSessionData';
import { AgentVisualizationWrapper } from './AgentVisualizationWrapper';
import { AudiogramRecorder } from './utils/recording';
import { SquigglyVisualizer } from './visualizers/SquigglyVisualizer';
import { MusicolorsVisualizer } from './visualizers/MusicolorsVisualizer';

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

interface WordTiming {
  word: string;
  start: number;
  end: number;
  highlighted: boolean;
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

  const [currentWords, setCurrentWords] = useState<WordTiming[]>([]);

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
      case 'musicolors':
        MusicolorsVisualizer(visualizerProps);
        break;
      case 'filledWave':
        FilledWaveVisualizer(visualizerProps);
        break;
      case 'line':
        LineVisualizer(visualizerProps);
        break;
      case 'squiggly':
        SquigglyVisualizer(visualizerProps);
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
    console.log('Session audio URL:', sessionAudioUrl);
    if (!audioRef.current || !sessionAudioUrl) {
      console.log('Audio not ready:', { 
        audioRef: !!audioRef.current, 
        hasUrl: !!sessionAudioUrl 
      });
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
    if (!canvasRef.current || !analyserRef.current || !isInitialized) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale canvas for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    let animationFrame: number;
    
    const draw = () => {
      if (!isPlaying) return;
      
      animationFrame = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      // Clear the entire canvas before drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw visualization
      const totalSize = canvas.width / window.devicePixelRatio;
      drawVisualization(ctx, canvas, dataArray, totalSize);
    };

    if (isPlaying) {
      draw();
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, isInitialized, visualizationType, initialConfig.barColor, 
    initialConfig.visualizerHeight, initialConfig.titleSize, 
    initialConfig.titleColor, initialConfig.transcriptSize,
    initialConfig.transcriptColor, initialConfig.barWidth,
    initialConfig.barSpacing, initialConfig.cornerRadius]); // Add all config dependencies

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
    if (!transcriptData.length) {
      console.log('No transcript data:', transcriptData);
      return;
    }

    // Get the first and last timestamps to calculate total duration
    const firstTimestamp = Math.min(...transcriptData.map(s => s.firstReceivedTime || 0));
    const lastTimestamp = Math.max(...transcriptData.map(s => s.lastReceivedTime || 0));
    const totalDuration = lastTimestamp - firstTimestamp;

    // Calculate current position in transcript time
    const audioDuration = audioRef.current?.duration || 0;
    const normalizedTime = firstTimestamp + (time / audioDuration * totalDuration);

    console.log('Time info:', {
      currentTime: time,
      audioDuration,
      firstTimestamp,
      lastTimestamp,
      normalizedTime
    });

    // Find the current segment
    const currentSegment = transcriptData.find((segment, index) => {
      const segmentStart = segment.firstReceivedTime || 0;
      const nextSegment = transcriptData[index + 1];
      const segmentEnd = nextSegment?.firstReceivedTime ?? (segment.lastReceivedTime || segmentStart + 5000);

      const isCurrentSegment = normalizedTime >= segmentStart && normalizedTime < segmentEnd;

      if (isCurrentSegment) {
        console.log('Found segment:', {
          text: segment.text,
          start: segmentStart,
          end: segmentEnd,
          role: segment.role,
          time: normalizedTime
        });
      }

      return isCurrentSegment;
    });

    if (currentSegment && currentSegment.text !== currentTranscript) {
      console.log('Updating transcript:', {
        text: currentSegment.text,
        role: currentSegment.role,
        time: normalizedTime
      });
      setCurrentTranscript(currentSegment.text);
    }
  }, [transcriptData, currentTranscript]);

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

  // Add this effect to handle config changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Force a redraw when config changes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const totalSize = canvas.width / window.devicePixelRatio;
      drawVisualization(ctx, canvas, dataArray, totalSize);
    }
  }, [initialConfig, drawVisualization]); // Add drawVisualization to dependencies

  // Update the main visualization effect dependencies
  useEffect(() => {
    // ... existing visualization code ...
  }, [
    isPlaying, 
    isInitialized, 
    visualizationType,
    initialConfig, // Add the entire config object
    drawVisualization
  ]);

  // Add a useEffect to handle initial config
  useEffect(() => {
    // Set initial config with defaults
    onConfigChange({
      ...DEFAULT_CONFIG,
      ...initialConfig
    });
  }, []); // Run once on mount

  // Add this useEffect to log transcript data when it changes
  useEffect(() => {
    if (transcript) {
      console.log('Transcript data loaded:', transcript.map(t => ({
        text: t.text,
        role: t.role,
        start: t.firstReceivedTime,
        end: t.lastReceivedTime
      })));
    }
  }, [transcript]);

  return (
    <div className="space-y-4">
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
        <div className="absolute inset-0 flex flex-col">
          {/* Header with logo and username */}
          <AudiogramHeader 
            username={session.user?.username || ''} 
            avatarUrl={session.user?.avatar}
          />
          
          {/* Title Section */}
          <div className="px-4 pt-16 pb-4 bg-gradient-to-b from-black/80 to-transparent">
            <h1 
              className="text-white font-bold text-center"
              style={{
                fontSize: `${initialConfig.titleSize || 32}px`,
                color: initialConfig.titleColor || '#FFFFFF'
              }}
            >
              {session.title}
            </h1>
          </div>

          {/* Transcript Section */}
          <div className="flex-1 flex items-center justify-center px-8 z-10">
            <div 
              className="text-white text-center max-w-3xl"
              style={{
                fontSize: `${initialConfig.transcriptSize || 20}px`,
                color: initialConfig.transcriptColor || '#FFFFFF',
                position: 'relative',
                transform: 'translateY(-50%)',
                transition: 'opacity 0.3s ease',
                opacity: currentTranscript ? 1 : 0
              }}
            >
              {currentTranscript && (
                <div 
                  key={currentTranscript}
                  className={styles['animate-fade-in']}
                >
                  {currentTranscript}
                </div>
              )}
            </div>
          </div>

          {/* Visualization Area */}
          <div 
            className="absolute left-0 right-0" 
            style={{ 
              height: `${(initialConfig.visualizerHeight || 0.3) * 100}%`,
              bottom: '24px', // Fixed position from bottom
              transform: 'translateY(-50%)', // Center the visualization
            }}
          >
            <canvas 
              ref={canvasRef} 
              className="w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Audio player - Now properly positioned below */}
      <div className="w-full">
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
  );
} 