import { Player, PlayerRef } from '@remotion/player';
import { AudiogramComposition } from '@/remotion/templates/audiogram-basic/Composition';
import { useEffect, useMemo, useState } from 'react';
import { AudiogramInputProps, VideoFormat, VIDEO_FORMATS } from '@/remotion/templates/audiogram-basic/types';
import { fps } from '@/remotion/templates/audiogram-basic/constants';

interface PlayerOnlyProps {
  playerRef: React.RefObject<PlayerRef>;
  session: {
    audioUrl: string;
    title: string;
    user: {
      avatar: string;
      username: string;
    };
    transcriptData?: string;
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
  const duration = Math.max(1, config.endTime - config.startTime);
  const durationInFrames = Math.floor(duration * fps);

  const inputProps = useMemo((): AudiogramInputProps => {
    console.log('PlayerOnly creating inputProps with session:', {
      transcriptData: session.transcriptData,
      audioUrl: session.audioUrl
    });
    
    return ({
      audioFileName: session.audioUrl,
      coverImgFileName: session.user.avatar,
      titleText: config.title,
      titleColor: "#cbd5e1",
      username: session.user.username,
      waveColor: "#3b82f6",
      waveFreqRangeStartIndex: 7,
      waveLinesToDisplay: 39,
      waveNumberOfSamples: "256" as const,
      mirrorWave: true,
      durationInSeconds: duration,
      audioOffsetInSeconds: config.startTime,
      transcriptData: session.transcriptData,
      subtitlesTextColor: "#cbd5e1",
    });
  }, [session, config, duration]);

  const { width, height } = VIDEO_FORMATS[format];

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div 
        className="relative max-w-xl mx-auto"
        style={{ 
          aspectRatio: `${width} / ${height}`,
        }}
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
            position: 'absolute',
            width: '100%',
            height: '100%',
            inset: 0,
          }}
          inputProps={inputProps}
        />
      </div>
    </div>
  );
}; 