'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { isSafari } from '@/lib/browser-utils';

// Add these type definitions at the top of the file
type BrowserInfo = {
  userAgent: string;
  vendor: string;
  isSafari: boolean;
  audioSupport: {
    ogg: string;
    oggVorbis: string;
    oggOpus: string;
    mp3: string;
    wav: string;
  };
};

type AudioState = {
  error: string | null;
  networkState: number;
  readyState: number;
  currentSrc: string;
  crossOrigin: string | null;
  duration: number;
  paused: boolean;
};

export default function AudioTestPage() {
  const [audioUrl, setAudioUrl] = useState('');
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [audioState, setAudioState] = useState<AudioState | null>(null);

  useEffect(() => {
    // Gather browser information
    const audio = new Audio();
    const info = {
      userAgent: navigator.userAgent,
      vendor: navigator.vendor,
      isSafari: isSafari(),
      audioSupport: {
        ogg: audio.canPlayType('audio/ogg'),
        oggVorbis: audio.canPlayType('audio/ogg; codecs="vorbis"'),
        oggOpus: audio.canPlayType('audio/ogg; codecs="opus"'),
        mp3: audio.canPlayType('audio/mpeg'),
        wav: audio.canPlayType('audio/wav'),
      }
    };
    setBrowserInfo(info);
  }, []);

  // Test URL validity
  const testUrl = async (url: string) => {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'cors',
      });
      return {
        ok: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        cors: response.headers.get('access-control-allow-origin'),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAudioUrl(e.target.value);
  };

  const updateAudioState = () => {
    if (audioRef.current) {
      setAudioState({
        error: audioRef.current.error?.message || null,
        networkState: audioRef.current.networkState,
        readyState: audioRef.current.readyState,
        currentSrc: audioRef.current.currentSrc,
        crossOrigin: audioRef.current.crossOrigin,
        duration: audioRef.current.duration,
        paused: audioRef.current.paused,
      });
    }
  };

  const handleAudioError = async (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const audio = e.currentTarget;
    const urlTest = await testUrl(audioUrl);
    console.error('Audio Error:', {
      error: audio.error,
      networkState: audio.networkState,
      readyState: audio.readyState,
      currentSrc: audio.currentSrc,
      crossOrigin: audio.crossOrigin,
      urlTest,
    });
    updateAudioState();
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Audio Playback Test</h1>
      
      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Browser Information</h2>
        <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-x-auto">
          {JSON.stringify(browserInfo, null, 2)}
        </pre>
      </Card>

      <Card className="p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Audio URL</h2>
        <Textarea 
          value={audioUrl}
          onChange={handleUrlChange}
          className="mb-4 font-mono text-sm"
          rows={4}
        />
        
        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mb-4">
          <h3 className="text-md font-semibold mb-2">Native Audio Player</h3>
          <audio 
            ref={audioRef}
            controls 
            className="w-full"
            onError={handleAudioError}
            onLoadedMetadata={updateAudioState}
            onLoadedData={updateAudioState}
            crossOrigin="anonymous"
          >
            <source 
              src={audioUrl} 
              type="audio/ogg"
            />
            Your browser does not support the audio element.
          </audio>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
          <h3 className="text-md font-semibold mb-2">Audio Element State</h3>
          <pre className="overflow-x-auto">
            {JSON.stringify(audioState, null, 2)}
          </pre>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">Debug Actions</h2>
        <div className="space-y-2">
          <Button 
            onClick={async () => {
              const urlTest = await testUrl(audioUrl);
              console.log('URL Test Results:', urlTest);
              updateAudioState();
            }}
            variant="outline"
            className="mr-2"
          >
            Test URL
          </Button>
          <Button 
            onClick={updateAudioState}
            variant="outline"
          >
            Update Audio State
          </Button>
        </div>
      </Card>
    </div>
  );
} 