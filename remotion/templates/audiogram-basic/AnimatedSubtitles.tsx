import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { interpolate, Easing } from 'remotion';
import { SPEAKER_COLORS, DEFAULT_COLORS, ANIMATION } from './constants';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface Utterance {
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker: string;
  timestamps: [string, number, number, number][];
}

interface Props {
  subtitles: string;
  textColor?: string;
}

const parseTimestamp = (seconds: number, fps: number): number => {
  return Math.floor(seconds * fps);
};

const parseJSON = (jsonStr: string, fps: number): Utterance[] => {
  try {
    const utterances: Utterance[] = JSON.parse(jsonStr);
    return utterances.map(utterance => ({
      ...utterance,
      start: parseTimestamp(utterance.start, fps),
      end: parseTimestamp(utterance.end, fps),
      timestamps: utterance.timestamps || []
    }));
  } catch (error) {
    console.error('Failed to parse JSON subtitles:', error);
    return [];
  }
};

export const AnimatedSubtitles: React.FC<Props> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const utterances = React.useMemo(() => parseJSON(subtitles, fps), [subtitles, fps]);

  // Find current utterance
  const currentUtterance = utterances.find(u => frame >= u.start && frame <= u.end);
  
  if (!currentUtterance) return null;

  const textColor = currentUtterance.speaker 
    ? SPEAKER_COLORS[currentUtterance.speaker as keyof typeof SPEAKER_COLORS]?.text 
    : DEFAULT_COLORS.text;

  return (
    <div className="captions">
      <div className="captions-content">
        {currentUtterance.timestamps.map(([word, start, end, confidence], i) => {
          const wordStart = parseTimestamp(start, fps);
          const utteranceEnd = currentUtterance.end;

          const fadeIn = interpolate(
            frame,
            [wordStart, wordStart + ANIMATION.wordFadeInDuration],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.out(Easing.quad)
            }
          );

          const fadeOut = interpolate(
            frame,
            [utteranceEnd - ANIMATION.sentenceFadeOutDuration, utteranceEnd],
            [1, 0],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              easing: Easing.in(Easing.quad)
            }
          );

          const finalOpacity = Math.min(fadeIn, fadeOut);

          return (
            <span
              key={i}
              style={{
                color: textColor,
                opacity: finalOpacity,
                display: 'inline-block',
                marginRight: '0.3em',
                fontSize: 'calc(var(--base-size) * 1.5)',
                fontWeight: 600,
                textShadow: '0px 0px 6px rgba(0, 0, 0, 0.5)'
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}; 