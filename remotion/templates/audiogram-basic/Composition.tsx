import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import React, { useEffect, useRef, useState } from "react";
import {
  AbsoluteFill,
  Audio,
  continueRender,
  delayRender,
  Img,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import "./style.css";

export const fps = 30;

import { AnimatedSubtitles } from "./AnimatedSubtitles";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { SPEAKER_COLORS, DEFAULT_COLORS } from './constants';

export const AudioGramSchema = z.object({
  durationInSeconds: z.number().positive(),
  audioOffsetInSeconds: z.number().min(0),
  audioFileName: z.string(),
  coverImgFileName: z.string(),
  titleText: z.string(),
  titleColor: zColor(),
  username: z.string(),
  waveColor: zColor(),
  waveLinesToDisplay: z.number().int().min(0),
  waveFreqRangeStartIndex: z.number().int().min(0),
  waveNumberOfSamples: z.enum(["32", "64", "128", "256", "512"]),
  mirrorWave: z.boolean(),
  transcriptUrl: z.string().optional(),
  subtitlesTextColor: zColor().optional(),
  subtitlesLinePerPage: z.number().int().min(0).optional(),
  subtitlesLineHeight: z.number().int().min(0).optional(),
  onlyDisplayCurrentSentence: z.boolean().optional(),
});

type AudiogramCompositionSchemaType = z.infer<typeof AudioGramSchema>;

const AudioViz: React.FC<{
  readonly waveColor: string;
  readonly numberOfSamples: number;
  readonly freqRangeStartIndex: number;
  readonly waveLinesToDisplay: number;
  readonly mirrorWave: boolean;
  readonly audioData: ReturnType<typeof useAudioData>;
  readonly currentSpeaker?: string;
}> = ({
  waveColor,
  numberOfSamples,
  freqRangeStartIndex,
  waveLinesToDisplay,
  mirrorWave,
  audioData,
  currentSpeaker,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!audioData) {
    return <div className="audio-viz" />;
  }

  const frequencyData = visualizeAudio({
    fps,
    frame,
    audioData,
    numberOfSamples,
  });

  const frequencyDataSubset = frequencyData.slice(
    freqRangeStartIndex,
    freqRangeStartIndex +
      (mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay),
  );

  const frequenciesToDisplay = mirrorWave
    ? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
    : frequencyDataSubset;

  const currentColor = currentSpeaker 
    ? SPEAKER_COLORS[currentSpeaker as keyof typeof SPEAKER_COLORS]?.wave 
    : waveColor;

  return (
    <div className="audio-viz">
      {frequenciesToDisplay.map((v, i) => {
        return (
          <div
            key={i}
            className="bar"
            style={{
              minWidth: "1px",
              backgroundColor: currentColor,
              height: `${500 * Math.sqrt(v)}%`,
            }}
          />
        );
      })}
    </div>
  );
};

// Add interface for utterance at the top with other interfaces
interface Utterance {
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker: string;
  timestamps: [string, number, number, number][];
}

export const AudiogramComposition: React.FC<z.infer<typeof AudioGramSchema>> = ({
  audioFileName,
  coverImgFileName,
  titleText,
  username,
  waveColor,
  waveNumberOfSamples,
  waveFreqRangeStartIndex,
  waveLinesToDisplay,
  mirrorWave,
  audioOffsetInSeconds,
  durationInSeconds,
  transcriptUrl,
  subtitlesTextColor = "#ffffff",
  subtitlesLinePerPage = 3,
  subtitlesLineHeight = 60,
  onlyDisplayCurrentSentence = true,
}) => {
  const audioOffsetInFrames = Math.round(audioOffsetInSeconds * fps);
  const frame = useCurrentFrame();
  const [subtitles, setSubtitles] = useState<string | null>(null);
  const [handle] = useState(() => delayRender());
  const [currentSpeaker, setCurrentSpeaker] = useState<string | undefined>();
  
  const audioData = useAudioData(audioFileName);

  useEffect(() => {
    if (!subtitles) return;
    
    try {
      const utterances = JSON.parse(subtitles) as Utterance[];
      const currentUtterance = utterances.find((u: Utterance) => {
        const start = Math.floor(u.start * fps);
        const end = Math.floor(u.end * fps);
        return frame >= start && frame <= end;
      });

      setCurrentSpeaker(currentUtterance?.speaker);
    } catch (error) {
      console.error('Failed to parse subtitles for speaker:', error);
    }
  }, [subtitles, frame, fps]);

  useEffect(() => {
    if (!transcriptUrl) {
      continueRender(handle);
      return;
    }

    fetch(transcriptUrl)
      .then((response) => response.json())
      .then((json: any) => {
        setSubtitles(JSON.stringify(json));
        continueRender(handle);
      })
      .catch((err: Error) => {
        console.error('Failed to fetch subtitles:', err);
        continueRender(handle);
      });
  }, [transcriptUrl, handle]);

  return (
    <AbsoluteFill>
      <Sequence from={-audioOffsetInFrames}>
        <Audio src={audioFileName} />
        <div className="container">
          <div className="background">
            <Img className="background-image" src={coverImgFileName} />
          </div>
          
          <div className="content">
            <div className="row">
              <Img className="cover" src={coverImgFileName} />
              <div className="text-content">
                <div className="username">@{username}</div>
                <div className="title">{titleText}</div>
              </div>
            </div>

            <AudioViz
              audioData={audioData}
              mirrorWave={mirrorWave}
              waveColor={currentSpeaker 
                ? SPEAKER_COLORS[currentSpeaker as keyof typeof SPEAKER_COLORS]?.wave 
                : waveColor}
              numberOfSamples={Number(waveNumberOfSamples)}
              freqRangeStartIndex={waveFreqRangeStartIndex}
              waveLinesToDisplay={waveLinesToDisplay}
              currentSpeaker={currentSpeaker}
            />

            {subtitles && (
              <AnimatedSubtitles
                subtitles={subtitles}
              />
            )}
          </div>
        </div>
      </Sequence>
    </AbsoluteFill>
  );
};
