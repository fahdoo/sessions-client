'use client';

import { Wave } from "@foobar404/wave";
import { useEffect, useRef, useState } from "react";
import { useUser } from '@clerk/nextjs';

// Simple visualization types that Wave.js actually supports
type VisualizationType = 'Glob' | 'Wave' | 'Lines' | 'Square';

// Default visualization type
const DEFAULT_VISUALIZATION: VisualizationType = 'Glob';

// Title configuration
const TITLE_CONFIG = {
  DEFAULT_POSITION: 80,    // Default position from top (range: 0-100%)
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

// Add these types
interface TimedImage {
  startTime: number;
  duration: number;
  imageUrl: string;
}

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

  // Move noiseTexture inside component
  const noiseTexture = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    opacity: noiseOpacity,
    mixBlendMode: 'overlay' as const
  };

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

    // Increase margin slightly for better spacing
    const margin = VISUALIZATION_CONFIG.HEADER.MARGIN * dpr;
    
    // Header height for alignment
    const headerHeight = VISUALIZATION_CONFIG.HEADER.HEIGHT * dpr;
    const headerTop = VISUALIZATION_CONFIG.HEADER.TOP_SPACING * dpr;

    // Enable crisp text and image rendering
    ctx.textRendering = 'optimizeLegibility';
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw header
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = `bold ${VISUALIZATION_CONFIG.HEADER.FONT_SIZE * dpr}px -apple-system, BlinkMacSystemFont, system-ui`;
    
    // Draw logo with high quality
    if (logoImage) {
      const logoSize = headerHeight;
      const logoY = headerTop;
      ctx.save();
      // Use better image rendering for logo
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(logoImage, margin, logoY, logoSize, logoSize);
      ctx.restore();
    }
    
    // Draw app name aligned with logo
    const appNameX = margin + headerHeight + (12 * dpr); // logo + spacing
    const textY = headerTop + (headerHeight * 0.65); // Vertically center with logo
    ctx.fillText('sessional.ai', appNameX, textY);
    
    // Draw username and avatar
    if (user?.username) {
      const username = `@${user.username}`;
      const usernameMetrics = ctx.measureText(username);
      const avatarSize = headerHeight;
      
      // Draw avatar first (rightmost element)
      if (avatarImage) {
        const avatarX = actualWidth - margin - avatarSize;
        const avatarY = headerTop;
        
        ctx.save();
        // High quality avatar rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Clip circle for avatar
        ctx.beginPath();
        const centerX = avatarX + (avatarSize / 2);
        const centerY = avatarY + (avatarSize / 2);
        ctx.arc(centerX, centerY, avatarSize / 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Draw avatar
        ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        ctx.restore();
      }
      
      // Draw username aligned with avatar
      const usernameX = actualWidth - margin - avatarSize - (16 * dpr) - usernameMetrics.width;
      ctx.fillText(username, usernameX, textY);
    }
    ctx.restore();

    // Draw title
    ctx.save();
    ctx.font = `bold ${titleSize * dpr}px -apple-system, BlinkMacSystemFont, system-ui`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const titleX = actualWidth / 2;
    const titleY = actualHeight * (titlePosition / 100); // Properly calculate position based on percentage
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
    
    // Don't scale context - we'll handle DPI in our drawing calculations
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
  }, [backgroundImage, logoImage, avatarImage, user, titleSize]);

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

  // Add the configuration section below the canvas
  const imageConfigSection = (
    <div className="mt-8 space-y-4 max-w-md mx-auto">
      <div className="space-y-2">
        <label className="block text-sm font-medium">Default Background Image URL</label>
        <input
          type="text"
          value={defaultBackground}
          onChange={(e) => setDefaultBackground(e.target.value)}
          placeholder="Enter default image URL"
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium">Timed Background Images</label>
          <button
            onClick={() => setTimedImages([...timedImages, { startTime: 0, duration: 0, imageUrl: '' }])}
            className="text-sm px-2 py-1 bg-slate-800 rounded hover:bg-slate-700"
          >
            + Add Time
          </button>
        </div>

        <div className="space-y-2">
          {timedImages.map((img, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="number"
                value={img.startTime}
                onChange={(e) => {
                  const newImages = [...timedImages];
                  newImages[index].startTime = Number(e.target.value);
                  setTimedImages(newImages);
                }}
                placeholder="Start (s)"
                className="w-20 p-2 border rounded"
                min="0"
              />
              <input
                type="number"
                value={img.duration}
                onChange={(e) => {
                  const newImages = [...timedImages];
                  newImages[index].duration = Number(e.target.value);
                  setTimedImages(newImages);
                }}
                placeholder="Duration (s)"
                className="w-20 p-2 border rounded"
                min="0"
              />
              <input
                type="text"
                value={img.imageUrl}
                onChange={(e) => {
                  const newImages = [...timedImages];
                  newImages[index].imageUrl = e.target.value;
                  setTimedImages(newImages);
                }}
                placeholder="Image URL (optional)"
                className="flex-1 p-2 border rounded"
              />
              <button
                onClick={() => {
                  const newImages = timedImages.filter((_, i) => i !== index);
                  setTimedImages(newImages);
                }}
                className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8">
      {/* Controls */}
      <div className="max-w-md mx-auto space-y-4">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as VisualizationType)}
          className="border p-2 rounded bg-white text-black w-full"
        >
          <option value="Glob">Glob</option>
          <option value="Wave">Wave</option>
          <option value="Lines">Lines</option>
          <option value="Square">Square</option>
        </select>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Title Position (%)</label>
          <input
            type="range"
            min="0"
            max="100"
            value={titlePosition}
            onChange={(e) => setTitlePosition(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Title Size (px)</label>
          <input
            type="range"
            min={TITLE_CONFIG.MIN_SIZE}
            max={TITLE_CONFIG.MAX_SIZE}
            value={titleSize}
            onChange={(e) => setTitleSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Background Blur (px)</label>
          <input
            type="range"
            min={BACKGROUND_CONFIG.MIN_BLUR}
            max={BACKGROUND_CONFIG.MAX_BLUR}
            value={backgroundBlur}
            onChange={(e) => setBackgroundBlur(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Glob Opacity</label>
          <input
            type="range"
            min={VISUALIZATION_CONFIG.GLOB.MIN_OPACITY}
            max={VISUALIZATION_CONFIG.GLOB.MAX_OPACITY}
            step={VISUALIZATION_CONFIG.GLOB.STEP}
            value={globOpacity}
            onChange={(e) => setGlobOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Vignette Strength</label>
          <input
            type="range"
            min={BACKGROUND_CONFIG.MIN_VIGNETTE}
            max={BACKGROUND_CONFIG.MAX_VIGNETTE}
            step="0.1"
            value={vignetteStrength}
            onChange={(e) => setVignetteStrength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Noise Opacity</label>
          <input
            type="range"
            min={BACKGROUND_CONFIG.MIN_NOISE}
            max={BACKGROUND_CONFIG.MAX_NOISE}
            step="0.01"
            value={noiseOpacity}
            onChange={(e) => setNoiseOpacity(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <audio 
          ref={audioRef}
          controls
          crossOrigin="anonymous"
          src="/test-audio.mp3"
          className="w-full"
          onTimeUpdate={() => {
            // Force re-render to update background
            setTimedImages([...timedImages]);
          }}
        />
      </div>

      {/* Visualization Container */}
      <div className="max-w-md mx-auto">
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

      {/* Image Configuration */}
      {imageConfigSection}
    </div>
  );
} 