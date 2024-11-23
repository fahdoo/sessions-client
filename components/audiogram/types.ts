import { z } from "zod";
import { zColor } from "@remotion/zod-types";

// Define the schema for Audiogram input props
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

// Define the types for Audiogram input props
export type AudiogramInputProps = z.infer<typeof AudioGramSchema>;

export type WaveNumberOfSamples = "32" | "64" | "128" | "256" | "512";

export type VideoFormat = 'square' | 'landscape' | 'portrait' | 'story';

export interface VideoFormatConfig {
  width: number;
  height: number;
  label: string;
  platforms: string;
}

export const VIDEO_FORMATS: Record<VideoFormat, VideoFormatConfig> = {
  square: {
    width: 1080,
    height: 1080,
    label: 'Square',
    platforms: 'Instagram, Facebook, Twitter'
  },
  landscape: {
    width: 1920,
    height: 1080,
    label: 'Landscape',
    platforms: 'YouTube, Facebook'
  },
  portrait: {
    width: 1080,
    height: 1350,
    label: 'Portrait',
    platforms: 'Instagram, Facebook'
  },
  story: {
    width: 1080,
    height: 1920,
    label: 'Story',
    platforms: 'Instagram Stories, TikTok, YouTube Shorts'
  }
}; 