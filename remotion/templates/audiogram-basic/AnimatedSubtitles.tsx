import React, { useEffect, useState } from 'react';
import { delayRender, continueRender, useCurrentFrame, useVideoConfig } from 'remotion';
import { interpolate, Easing } from 'remotion';
import { SPEAKER_COLORS, DEFAULT_COLORS, ANIMATION } from './constants';

interface Utterance {
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker: string;
  timestamps: Array<[string, number, number, number]>;
}

interface Props {
  subtitles: string;
}

export const AnimatedSubtitles: React.FC<Props> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [utterances, setUtterances] = useState<Utterance[]>([]);
  const [handle] = useState(() => delayRender());

  useEffect(() => {
    try {
      const parsed = JSON.parse(subtitles);
      setUtterances(parsed);
      continueRender(handle);
    } catch (err) {
      console.error('Failed to parse subtitles:', err);
      continueRender(handle);
    }
  }, [subtitles, handle]);

  // Find current utterance
  const currentUtterance = utterances.find(u => {
    const start = Math.floor(u.start * fps);
    const end = Math.floor(u.end * fps);
    return frame >= start && frame <= end;
  });
  
  if (!currentUtterance) return null;

  const textColor = currentUtterance.speaker 
    ? SPEAKER_COLORS[currentUtterance.speaker as keyof typeof SPEAKER_COLORS]?.text 
    : DEFAULT_COLORS.text;

  return (
    <div className="remotion-captions">
      <div className="remotion-captions-content">
        {currentUtterance.timestamps.map(([word, start, end, confidence], i) => {
          const wordStart = Math.floor(start * fps);
          const utteranceEnd = Math.floor(currentUtterance.end * fps);

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
              className="remotion-caption-word"
              style={{
                color: textColor,
                opacity: finalOpacity,
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