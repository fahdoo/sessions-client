import { Player, PlayerRef } from '@remotion/player';
import { AudiogramComposition } from '@/remotion/templates/audiogram-basic/Composition';
import { useEffect, useMemo, useState } from 'react';
import { AudiogramInputProps } from '@/remotion/templates/audiogram-basic/types';
import { fps } from '@/remotion/templates/audiogram-basic/constants';
import { VideoFormat, VIDEO_FORMATS } from '@/remotion/templates/audiogram-basic/types';

interface PlayerOnlyProps {
  playerRef: React.RefObject<PlayerRef>;
  session: {
    audioUrl: string;
    title: string;
    user: {
      avatar: string;
      username: string;
    };
    transcriptUrl?: string;
    duration: number;
  };
  config: {
    title: string;
    startTime: number;
    endTime: number;
  };
  format: VideoFormat;
}

export const PlayerOnly: React.FC<PlayerOnlyProps> = ({ 
  playerRef,
  session,
  config,
  format
}) => {
  const [signedAudioUrl, setSignedAudioUrl] = useState<string | null>(null);
  const [signedTranscriptUrl, setSignedTranscriptUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSignedUrls = async () => {
      try {
        setIsLoading(true);
        
        // Always fetch audio URL
        const audioResponse = await fetch(`/api/signed-url?url=${encodeURIComponent(session.audioUrl)}`);
        if (!audioResponse.ok) {
          throw new Error('Failed to get signed audio URL');
        }
        const { signedUrl: audioUrl } = await audioResponse.json();
        setSignedAudioUrl(audioUrl);

        // Try to get transcript URL if not provided
        let transcriptUrl = session.transcriptUrl;
        if (!transcriptUrl) {
          // Replace the audio file extension with .json
          transcriptUrl = session.audioUrl.replace(/\.[^/.]+$/, '.json');
        }

        // Try to fetch transcript, but don't fail if it's not available
        try {
          const transcriptResponse = await fetch(`/api/signed-url?url=${encodeURIComponent(transcriptUrl)}`);
          if (transcriptResponse.ok) {
            const { signedUrl } = await transcriptResponse.json();
            // Verify the transcript exists by trying to fetch it
            const testResponse = await fetch(signedUrl);
            if (testResponse.ok) {
              setSignedTranscriptUrl(signedUrl);
            } else {
              console.log('Transcript file not found:', transcriptUrl);
              setSignedTranscriptUrl(null);
            }
          }
        } catch (error) {
          console.log('Failed to fetch transcript, continuing without it:', error);
          setSignedTranscriptUrl(null);
        }

      } catch (error) {
        console.error('Error fetching signed URLs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrls();
  }, [session.audioUrl, session.transcriptUrl]);

  const duration = Math.max(1, config.endTime - config.startTime);
  const durationInFrames = Math.floor(duration * fps);
  
  const inputProps = useMemo((): AudiogramInputProps => ({
    audioFileName: signedAudioUrl || '',
    coverImgFileName: session.user.avatar,
    titleText: config.title,
    titleColor: "#cbd5e1",
    username: session.user.username,
    waveColor: "#3b82f6",
    waveFreqRangeStartIndex: 7,
    waveLinesToDisplay: 39,
    waveNumberOfSamples: "256",
    mirrorWave: true,
    durationInSeconds: duration,
    audioOffsetInSeconds: config.startTime,
    transcriptUrl: signedTranscriptUrl || undefined,
    subtitlesTextColor: "#cbd5e1",
  }), [session, config, duration, signedAudioUrl, signedTranscriptUrl]);

  const { width, height } = VIDEO_FORMATS[format];
  const compositionId = `Audiogram${format.charAt(0).toUpperCase() + format.slice(1)}`;

  if (isLoading || !signedAudioUrl) {
    return (
      <div 
        className="w-full bg-muted rounded-lg"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <Player
        ref={playerRef}
        component={AudiogramComposition}
        compositionWidth={width}
        compositionHeight={height}
        durationInFrames={durationInFrames}
        fps={fps}
        controls
        autoPlay={false}
        loop
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
        }}
        inputProps={inputProps}
        compositionId={compositionId}
      />
    </div>
  );
}; 