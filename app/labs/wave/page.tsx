'use client';

import { Wave } from "@foobar404/wave";
import { useEffect, useRef, useState } from "react";
import { useUser } from '@clerk/nextjs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Noto_Serif } from 'next/font/google';
import { X, Loader2 } from 'lucide-react';

// Initialize Noto Serif
const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

// Simple visualization types that Wave.js actually supports
type VisualizationType = 'Glob' | 'Wave' | 'Lines' | 'Square';

// Default visualization type
const DEFAULT_VISUALIZATION: VisualizationType = 'Glob';

// Title configuration
const TITLE_CONFIG = {
  DEFAULT_POSITION: 50,    // Default position from top (range: 0-100%)
  DEFAULT_SIZE: 24,        // Default font size in pixels (range: 16-48px)
  MIN_SIZE: 16,           // Minimum font size
  MAX_SIZE: 48            // Maximum font size
} as const;

// Background configuration
const BACKGROUND_CONFIG = {
  DEFAULT_BLUR: 20,       // Default blur amount (range: 0-40px)
  MIN_BLUR: 0,           // Minimum blur
  MAX_BLUR: 40,          // Maximum blur
  BRIGHTNESS: 0.5,        // Background brightness (range: 0-1)
  DEFAULT_VIGNETTE: 0.5,    // Default vignette strength (range: 0-1)
  MIN_VIGNETTE: 0,         // No vignette
  MAX_VIGNETTE: 1,
  DEFAULT_NOISE: 0.1,     // Default noise opacity (range: 0-0.3)
  MIN_NOISE: 0,          // No noise
  MAX_NOISE: 0.3,        // Maximum noise effect
} as const;

// Visualization configuration
const VISUALIZATION_CONFIG = {
  // Glob specific settings
  GLOB: {
    DEFAULT_OPACITY: 0.5,   // Default opacity (range: 0-1)
    MIN_OPACITY: 0,      // Minimum opacity
    MAX_OPACITY: 1,      // Maximum opacity
    STEP: 0.1,          // Opacity slider step
    COUNT: 45,          // Number of points in glob
    SIZE_RATIO: 0.2     // Ratio of container size for diameter (range: 0-1)
  },
  // Header UI settings
  HEADER: {
    MARGIN: 32,         // Increased margin to match top spacing
    HEIGHT: 32,
    TOP_SPACING: 32,    // Match side margin
    FONT_SIZE: 18
  }
} as const;

// Text configuration
const TEXT_CONFIG = {
  APP_TITLE: {
    DEFAULT_SIZE: 18,
    MIN_SIZE: 12,
    MAX_SIZE: 32
  },
  USERNAME: {
    DEFAULT_SIZE: 18,
    MIN_SIZE: 12,
    MAX_SIZE: 32
  },
  SESSION_TITLE: {
    DEFAULT_SIZE: 24,
    MIN_SIZE: 16,
    MAX_SIZE: 48
  }
} as const;

// Add these types
interface TimedImage {
  startTime: number;
  duration: number;
  imageUrl: string;
}

// Add this helper function at the top level
function getSupportedMimeType() {
  const types = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=h264,opus',
    'video/webm',
    'video/x-matroska;codecs=avc1,opus'
  ];

  return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
}

// Add this function to create our own Glob visualization
const createGlobVisualization = (analyser: AnalyserNode, canvas: HTMLCanvasElement, opacity: number) => {
  const ctx = canvas.getContext('2d')!;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  // Number of points in the glob
  const points = VISUALIZATION_CONFIG.GLOB.COUNT;
  // Base radius
  const radius = Math.min(canvas.width, canvas.height) * VISUALIZATION_CONFIG.GLOB.SIZE_RATIO;

  const draw = () => {
    analyser.getByteFrequencyData(dataArray);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate center
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Draw glob
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1;

    // Create points around a circle
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      // Get frequency data for this point
      const freqIndex = Math.floor((i / points) * bufferLength);
      // Use frequency data to modify radius
      const value = dataArray[freqIndex] / 255.0;
      const dynamicRadius = radius * (1 + value * 0.5);

      const x = centerX + Math.cos(angle) * dynamicRadius;
      const y = centerY + Math.sin(angle) * dynamicRadius;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    requestAnimationFrame(draw);
  };

  return draw;
};

// Add proper codec detection
const getMimeType = () => {
  const types = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];
  return types.find(type => MediaRecorder.isTypeSupported(type)) || '';
};

export default function WaveTest() {
  const { user } = useUser();
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<Wave | null>(null);
  const [type, setType] = useState<VisualizationType>(DEFAULT_VISUALIZATION);
  const [titlePosition, setTitlePosition] = useState<number>(TITLE_CONFIG.DEFAULT_POSITION); // percentage from top
  const [titleSize, setTitleSize] = useState<number>(TITLE_CONFIG.DEFAULT_SIZE); // pixels
  const [backgroundBlur, setBackgroundBlur] = useState<number>(BACKGROUND_CONFIG.DEFAULT_BLUR); // Default 20px blur
  const [globOpacity, setGlobOpacity] = useState<number>(VISUALIZATION_CONFIG.GLOB.DEFAULT_OPACITY); // Default opacity 1
  const [defaultBackground, setDefaultBackground] = useState<string>('');
  const [timedImages, setTimedImages] = useState<TimedImage[]>([
    { startTime: 0, duration: 0, imageUrl: '' }
  ]);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [avatarImage, setAvatarImage] = useState<HTMLImageElement | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const uiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [vignetteStrength, setVignetteStrength] = useState<number>(BACKGROUND_CONFIG.DEFAULT_VIGNETTE);
  const [noiseOpacity, setNoiseOpacity] = useState<number>(BACKGROUND_CONFIG.DEFAULT_NOISE);
  const [appTitleSize, setAppTitleSize] = useState<number>(TEXT_CONFIG.APP_TITLE.DEFAULT_SIZE);
  const [usernameSize, setUsernameSize] = useState<number>(TEXT_CONFIG.USERNAME.DEFAULT_SIZE);
  const [sessionTitleSize, setSessionTitleSize] = useState<number>(TEXT_CONFIG.SESSION_TITLE.DEFAULT_SIZE);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Add these refs for audio handling
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Move noiseTexture inside component
  const noiseTexture = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity: noiseOpacity,
    mixBlendMode: 'overlay' as const
  };

  // Add a second audio ref
  const recordingAudioRef = useRef<HTMLAudioElement>(null);

  // Load images on mount
  useEffect(() => {
    // Load logo in high quality
    const logo = new Image();
    logo.src = '/favicon.svg';
    logo.crossOrigin = 'anonymous';
    // Use largest available size for logo
    logo.onload = () => {
      setLogoImage(logo);
    };

    // Load avatar in high quality
    if (user?.imageUrl) {
      const avatar = new Image();
      // Request larger size if available (assuming Clerk URL)
      const highResAvatarUrl = user.imageUrl.replace(/size=\d+/, 'size=256');
      avatar.src = highResAvatarUrl;
      avatar.crossOrigin = 'anonymous';
      avatar.onload = () => {
        setAvatarImage(avatar);
      };
    }
  }, [user?.imageUrl]);

  // Load background image when it changes
  useEffect(() => {
    const currentTime = audioRef.current?.currentTime || 0;
    const bgUrl = getCurrentBackgroundImage(currentTime);
    
    if (bgUrl) {
      const img = new Image();
      img.src = bgUrl;
      img.crossOrigin = 'anonymous';
      img.onload = () => setBackgroundImage(img);
    }
  }, [defaultBackground, timedImages, user?.imageUrl]);

  // Main canvas drawing function
  const drawCanvas = () => {
    const canvas = uiCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const actualWidth = rect.width * dpr;
    const actualHeight = rect.height * dpr;

    // Base size calculations
    const margin = VISUALIZATION_CONFIG.HEADER.MARGIN * dpr;
    
    // App title section
    ctx.save();
    const appTitleFontSize = appTitleSize * dpr;
    const logoSize = appTitleFontSize * 1.2;

    // Draw logo
    if (logoImage) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const logoX = margin;
      const logoY = margin;
      ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
      ctx.restore();
    }

    // Draw app name aligned with logo center
    ctx.fillStyle = 'white';
    ctx.font = `italic ${appTitleFontSize}px ${notoSerif.style.fontFamily}`;
    const appNameX = margin + logoSize + (appTitleFontSize * 0.5);
    const appNameY = margin + (logoSize / 2) + (appTitleFontSize * 0.35); // Align with logo center
    ctx.fillText('Sessional.ai', appNameX, appNameY);
    ctx.restore();

    // Username and avatar section
    if (user?.username) {
      ctx.save();
      const usernameFontSize = usernameSize * dpr;
      const avatarSize = usernameFontSize * 1.2;
      
      // Calculate positions from bottom right
      const bottomMargin = margin;
      const rightMargin = margin;
      
      // Draw avatar
      if (avatarImage) {
        const avatarX = actualWidth - rightMargin - avatarSize;
        const avatarY = actualHeight - bottomMargin - avatarSize;
        
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        ctx.beginPath();
        const centerX = avatarX + (avatarSize / 2);
        const centerY = avatarY + (avatarSize / 2);
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      }
      
      // Draw username aligned with avatar center
      ctx.fillStyle = 'white';
      ctx.font = `${usernameFontSize}px -apple-system, BlinkMacSystemFont, system-ui`;
      const username = `@${user.username}`;
      const usernameMetrics = ctx.measureText(username);
      const usernameX = actualWidth - rightMargin - avatarSize - (usernameFontSize * 0.75) - usernameMetrics.width;
      const usernameY = actualHeight - bottomMargin - (avatarSize / 2) + (usernameFontSize * 0.35); // Align with avatar center
      ctx.fillText(username, usernameX, usernameY);
      ctx.restore();
    }

    // Session title
    ctx.save();
    const sessionFontSize = sessionTitleSize * dpr;
    ctx.font = `bold ${sessionFontSize}px -apple-system, BlinkMacSystemFont, system-ui`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleX = actualWidth / 2;
    const titleY = actualHeight * (titlePosition / 100);
    ctx.fillText('Wave.js Test Session', titleX, titleY);
    ctx.restore();
  };

  // Separate useEffect for UI rendering
  useEffect(() => {
    const uiCanvas = uiCanvasRef.current;
    const waveCanvas = canvasRef.current;
    if (!uiCanvas || !waveCanvas) return;

    const container = uiCanvas.parentElement!;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set both canvases to the same dimensions with DPI scaling
    [uiCanvas, waveCanvas].forEach(canvas => {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    });

    const ctx = uiCanvas.getContext('2d');
    if (!ctx) return;
    
    ctx.textRendering = 'optimizeLegibility';
    ctx.imageSmoothingEnabled = true;

    const animate = () => {
      drawCanvas();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      // Cleanup
    };
  }, [
    backgroundImage, 
    logoImage, 
    avatarImage, 
    user, 
    appTitleSize,    // Add new dependencies
    usernameSize,
    sessionTitleSize,
    titlePosition
  ]);

  // Separate useEffect for Wave.js
  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    if (!audio || !canvas) return;

    // Set up high DPI canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement!.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (!waveRef.current) {
      waveRef.current = new Wave(audio, canvas);
    }

    const wave = waveRef.current;
    wave.clearAnimations();

    if (type === 'Glob') {
      wave.addAnimation(new wave.animations.Glob({
        fillColor: `rgba(255, 255, 255, ${globOpacity})`,
        lineColor: `rgba(255, 255, 255, ${globOpacity})`,
        lineWidth: 1,
        count: VISUALIZATION_CONFIG.GLOB.COUNT,
        diameter: Math.min(rect.width, rect.height) * VISUALIZATION_CONFIG.GLOB.SIZE_RATIO
      }));
    } else {
      wave.addAnimation(new wave.animations[type]({
        lineColor: 'rgba(255, 255, 255, 0.8)',
        fillColor: 'rgba(255, 255, 255, 0.8)',
        count: 64
      }));
    }

    return () => {
      if (waveRef.current) {
        waveRef.current.clearAnimations();
      }
    };
  }, [type, audioRef.current, globOpacity]);

  // Add this helper function
  const getCurrentBackgroundImage = (currentTime: number) => {
    // Check if any timed image should be shown
    const activeImage = timedImages.find(img => {
      if (!img.imageUrl) return false;
      const endTime = img.startTime + img.duration;
      return currentTime >= img.startTime && currentTime < endTime;
    });

    // Return timed image URL, or default background, or user avatar
    return activeImage?.imageUrl || defaultBackground || user?.imageUrl;
  };

  // Update the recording functions
  const startRecording = async () => {
    if (!audioRef.current) return;
    
    try {
      setIsRecording(true);
      chunksRef.current = [];
      console.log('Starting recording setup...');

      // Create audio context and nodes
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audioRef.current);
      const analyser = audioContext.createAnalyser();
      const destination = audioContext.createMediaStreamDestination();

      // Connect nodes
      source.connect(analyser);
      source.connect(destination);
      source.connect(audioContext.destination);

      console.log('Audio nodes created');

      // Set up recording canvas
      const outputCanvas = document.createElement('canvas');
      const ctx = outputCanvas.getContext('2d');
      if (!ctx) return;

      // Match dimensions
      const rect = canvasRef.current!.getBoundingClientRect();
      outputCanvas.width = rect.width * window.devicePixelRatio;
      outputCanvas.height = rect.height * window.devicePixelRatio;

      // Create streams
      const canvasStream = outputCanvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // Create recorder
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });
      
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        console.log('Data chunk:', { size: e.data.size, type: e.data.type });
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        console.log('Recording stopped, chunks:', chunks.length);
        
        const blob = new Blob(chunks, { type: 'video/webm' });
        console.log('Final blob:', { size: blob.size, type: blob.type });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wave-visualization-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);
        audioContext.close();
      };

      // Start our visualization
      const drawGlob = createGlobVisualization(analyser, canvasRef.current!, globOpacity);

      // Animation loop for recording
      const animate = () => {
        if (!isRecording) return;
        
        // Clear the output canvas
        ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        
        // Draw UI canvas
        if (uiCanvasRef.current) {
          ctx.drawImage(uiCanvasRef.current, 0, 0);
        }
        
        // Call drawGlob to update visualization
        drawGlob();
        
        // Draw visualization canvas
        if (canvasRef.current) {
          ctx.drawImage(canvasRef.current, 0, 0);
        }
        
        requestAnimationFrame(animate);
      };

      // Start everything
      recorder.start(1000);
      animate(); // Start animation loop
      
      // Start audio
      audioRef.current.currentTime = 0;
      await audioRef.current.play();

      setMediaRecorder(recorder);

    } catch (error) {
      console.error('Recording failed:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      console.log('Current recorder state:', mediaRecorder.state);
      mediaRecorder.stop();
      if (audioRef.current) {
        audioRef.current.pause();
        console.log('Audio playback paused');
      }
    } else {
      console.log('MediaRecorder not active:', mediaRecorder?.state);
    }
  };

  // Add cleanup in component unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Move getWaveAnalyzer inside component
  const getWaveAnalyzer = async () => {
    if (!audioRef.current) return null;

    // Create temporary audio context
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    
    // Create Wave instance with just the analyzer
    const wave = new Wave(analyser, canvasRef.current!);
    
    // Now we can use the analyzer for both Wave and recording
    const source = audioContext.createMediaElementSource(audioRef.current);
    const destination = audioContext.createMediaStreamDestination();
    
    // Connect everything
    source.connect(analyser);
    source.connect(destination);
    source.connect(audioContext.destination);

    return { wave, analyser, audioContext, destination };
  };

  return (
    <div className="p-8 flex gap-8">
      {/* Left side - Visualization */}
      <div className="flex-1 space-y-8">
        {/* Visualization Container */}
        <div className="max-w-md">
          <div 
            className="relative bg-slate-900 overflow-hidden rounded-2xl"
            style={{ aspectRatio: '9/16' }}
          >
            {/* Background */}
            {user?.imageUrl && (
              <>
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getCurrentBackgroundImage(audioRef.current?.currentTime || 0)})`,
                    filter: `blur(${backgroundBlur}px) brightness(${BACKGROUND_CONFIG.BRIGHTNESS})`
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={noiseTexture}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: `radial-gradient(circle, transparent ${(1 - vignetteStrength) * 100}%, rgba(0,0,0,${vignetteStrength}) 100%)`
                  }}
                />
              </>
            )}

            {/* Background canvas for our UI elements */}
            <canvas 
              ref={uiCanvasRef}
              className="absolute inset-0 w-full h-full"
            />
            
            {/* Foreground canvas for Wave.js */}
            <canvas 
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>

        {/* Audio player */}
        <audio 
          ref={audioRef}
          controls
          crossOrigin="anonymous"
          src="/test-audio.mp3"
          className="w-full max-w-md"
          onTimeUpdate={() => {
            setTimedImages([...timedImages]);
          }}
        />
      </div>

      {/* Right side - Controls */}
      <Card className="w-[300px]">
        <CardContent className="py-6">
          <Tabs defaultValue="visualization" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="visualization">Viz</TabsTrigger>
              <TabsTrigger value="background">BG</TabsTrigger>
              <TabsTrigger value="publish">Publish</TabsTrigger>
            </TabsList>

            {/* Visualization Settings Tab */}
            <TabsContent value="visualization" className="space-y-6">
              {/* Visualization Type */}
              <div className="space-y-2">
                <Label>Visualization Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as VisualizationType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Glob">Glob</SelectItem>
                    <SelectItem value="Wave">Wave</SelectItem>
                    <SelectItem value="Lines">Lines</SelectItem>
                    <SelectItem value="Square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* App Title Size */}
              <div className="space-y-2">
                <Label>App Title Size (px)</Label>
                <Slider
                  min={TEXT_CONFIG.APP_TITLE.MIN_SIZE}
                  max={TEXT_CONFIG.APP_TITLE.MAX_SIZE}
                  step={1}
                  value={[appTitleSize]}
                  onValueChange={([value]) => setAppTitleSize(value)}
                />
              </div>

              {/* Username Size */}
              <div className="space-y-2">
                <Label>Username Size (px)</Label>
                <Slider
                  min={TEXT_CONFIG.USERNAME.MIN_SIZE}
                  max={TEXT_CONFIG.USERNAME.MAX_SIZE}
                  step={1}
                  value={[usernameSize]}
                  onValueChange={([value]) => setUsernameSize(value)}
                />
              </div>

              {/* Session Title Size */}
              <div className="space-y-2">
                <Label>Session Title Size (px)</Label>
                <Slider
                  min={TEXT_CONFIG.SESSION_TITLE.MIN_SIZE}
                  max={TEXT_CONFIG.SESSION_TITLE.MAX_SIZE}
                  step={1}
                  value={[sessionTitleSize]}
                  onValueChange={([value]) => setSessionTitleSize(value)}
                />
              </div>

              {/* Title Position */}
              <div className="space-y-2">
                <Label>Title Position (%)</Label>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[titlePosition]}
                  onValueChange={([value]) => setTitlePosition(value)}
                />
              </div>

              {/* Glob Opacity */}
              <div className="space-y-2">
                <Label>Glob Opacity</Label>
                <Slider
                  min={VISUALIZATION_CONFIG.GLOB.MIN_OPACITY}
                  max={VISUALIZATION_CONFIG.GLOB.MAX_OPACITY}
                  step={VISUALIZATION_CONFIG.GLOB.STEP}
                  value={[globOpacity]}
                  onValueChange={([value]) => setGlobOpacity(value)}
                />
              </div>
            </TabsContent>

            {/* Background Settings Tab */}
            <TabsContent value="background" className="space-y-6">
              {/* Background Blur */}
              <div className="space-y-2">
                <Label>Background Blur (px)</Label>
                <Slider
                  min={BACKGROUND_CONFIG.MIN_BLUR}
                  max={BACKGROUND_CONFIG.MAX_BLUR}
                  step={1}
                  value={[backgroundBlur]}
                  onValueChange={([value]) => setBackgroundBlur(value)}
                />
              </div>

              {/* Vignette Strength */}
              <div className="space-y-2">
                <Label>Vignette Strength</Label>
                <Slider
                  min={BACKGROUND_CONFIG.MIN_VIGNETTE}
                  max={BACKGROUND_CONFIG.MAX_VIGNETTE}
                  step={0.1}
                  value={[vignetteStrength]}
                  onValueChange={([value]) => setVignetteStrength(value)}
                />
              </div>

              {/* Noise Opacity */}
              <div className="space-y-2">
                <Label>Noise Opacity</Label>
                <Slider
                  min={BACKGROUND_CONFIG.MIN_NOISE}
                  max={BACKGROUND_CONFIG.MAX_NOISE}
                  step={0.01}
                  value={[noiseOpacity]}
                  onValueChange={([value]) => setNoiseOpacity(value)}
                />
              </div>

              {/* Default Background URL */}
              <div className="space-y-2">
                <Label>Default Background Image URL</Label>
                <Input
                  value={defaultBackground}
                  onChange={(e) => setDefaultBackground(e.target.value)}
                  placeholder="Enter default image URL"
                />
              </div>

              {/* Timed Background Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Timed Background Images</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setTimedImages([...timedImages, { startTime: 0, duration: 0, imageUrl: '' }])}
                  >
                    Add Image
                  </Button>
                </div>

                <div className="space-y-4">
                  {timedImages.map((img, index) => (
                    <div key={index} className="space-y-2 rounded-lg border border-slate-700/50 p-3">
                      {/* Image URL and delete button in same row */}
                      <div className="flex gap-2">
                        <Input
                          className="flex-1"
                          value={img.imageUrl}
                          onChange={(e) => {
                            const newImages = [...timedImages];
                            newImages[index].imageUrl = e.target.value;
                            setTimedImages(newImages);
                          }}
                          placeholder="Image URL"
                        />
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => {
                            const newImages = timedImages.filter((_, i) => i !== index);
                            setTimedImages(newImages);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Time inputs below with reduced width */}
                      <div className="flex gap-2">
                        <div className="w-[80px] space-y-1">
                          <Label className="text-xs text-muted-foreground">Start Time</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={img.startTime === 0 ? '' : img.startTime}
                              onChange={(e) => {
                                const newImages = [...timedImages];
                                newImages[index].startTime = Number(e.target.value);
                                setTimedImages(newImages);
                              }}
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              s
                            </span>
                          </div>
                        </div>
                        
                        <div className="w-[80px] space-y-1">
                          <Label className="text-xs text-muted-foreground">Duration</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              value={img.duration === 0 ? '' : img.duration}
                              onChange={(e) => {
                                const newImages = [...timedImages];
                                newImages[index].duration = Number(e.target.value);
                                setTimedImages(newImages);
                              }}
                              placeholder="0"
                              min="0"
                              step="0.1"
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              s
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Publish Tab */}
            <TabsContent value="publish" className="space-y-6">
              <Button 
                className="w-full" 
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={!audioRef.current}
              >
                {isRecording ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Stop Recording
                  </>
                ) : (
                  'Start Recording'
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Records visualization with audio and downloads as WebM video
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Hidden audio element for recording */}
      <audio 
        ref={recordingAudioRef}
        crossOrigin="anonymous"
        className="hidden"
      />
    </div>
  );
} 