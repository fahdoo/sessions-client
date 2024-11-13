'use client';

import { Wave } from "@foobar404/wave";
import { useEffect, useRef, useState } from "react";
import { useUser } from '@clerk/nextjs';
import { Noto_Serif } from 'next/font/google';

// Load Noto Serif font
const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

// Simple visualization types that Wave.js actually supports
type VisualizationType = 'Glob' | 'Wave' | 'Lines' | 'Square';

// Add this CSS class for noise texture
const noiseTexture = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  opacity: 0.05,
  mixBlendMode: 'overlay' as const
};

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
  const [type, setType] = useState<VisualizationType>('Glob');
  const [titlePosition, setTitlePosition] = useState(80); // percentage from top
  const [titleSize, setTitleSize] = useState(24); // pixels
  const [globBlur, setGlobBlur] = useState(2);
  const [defaultBackground, setDefaultBackground] = useState<string>('');
  const [timedImages, setTimedImages] = useState<TimedImage[]>([
    { startTime: 0, duration: 0, imageUrl: '' }
  ]);

  useEffect(() => {
    const audio = audioRef.current;
    const canvas = canvasRef.current;
    
    if (!audio || !canvas) return;

    if (!waveRef.current) {
      console.log('Creating Wave instance');
      waveRef.current = new Wave(audio, canvas);
    }

    const wave = waveRef.current;
    wave.clearAnimations();

    if (type === 'Glob') {
      wave.addAnimation(new wave.animations.Glob({
        fillColor: '#FFFFFF',
        lineColor: '#FFFFFF',
        lineWidth: 1,
        count: 45,
        diameter: Math.min(canvas.width, canvas.height) * 0.4
      }));
    } else {
      wave.addAnimation(new wave.animations[type]({
        lineColor: '#FFFFFF',
        fillColor: '#FFFFFF',
        count: 64
      }));
    }

    return () => {
      if (waveRef.current) {
        waveRef.current.clearAnimations();
      }
    };
  }, [type]);

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
            min="16"
            max="48"
            value={titleSize}
            onChange={(e) => setTitleSize(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Glob Blur (px)</label>
          <input
            type="range"
            min="0"
            max="10"
            value={globBlur}
            onChange={(e) => setGlobBlur(Number(e.target.value))}
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
                  filter: 'blur(20px) brightness(0.5)'
                }}
              />
              <div 
                className="absolute inset-0"
                style={noiseTexture}
              />
            </>
          )}

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between">
            <div className="text-white font-bold text-lg flex items-center gap-2">
              <img 
                src="/favicon.svg" 
                alt="sessional.ai logo" 
                className="w-6 h-6"
              /> 
              sessional.ai
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white">@{user?.username}</span>
              {user?.imageUrl && (
                <img 
                  src={user.imageUrl} 
                  alt={user.username || ''} 
                  className="w-8 h-8 rounded-full"
                />
              )}
            </div>
          </div>

          {/* Visualization - centered vertically */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[30%]">
            <div className="relative w-full h-full">
              {/* Add a subtle blur to the canvas */}
              <canvas 
                ref={canvasRef}
                className="w-full h-full"
                style={{ 
                  filter: type === 'Glob' ? `blur(${globBlur}px)` : 'none'
                }}
              />
            </div>
          </div>

          {/* Title - position controlled by slider */}
          <div 
            className="absolute left-0 right-0 px-8"
            style={{
              top: `${titlePosition}%`,
              transform: 'translateY(-50%)'
            }}
          >
            <h1 
              className={`text-white font-bold text-center ${notoSerif.className}`}
              style={{
                fontSize: `${titleSize}px`
              }}
            >
              Wave.js Test Session
            </h1>
          </div>
        </div>
      </div>

      {/* Image Configuration */}
      {imageConfigSection}
    </div>
  );
} 