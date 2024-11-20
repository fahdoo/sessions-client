export type WaveNumberOfSamples = "32" | "64" | "128" | "256" | "512";

export interface AudiogramInputProps {
  audioFileName: string;
  coverImgFileName: string;
  titleText: string;
  username: string;
  titleColor: string;
  waveColor: string;
  waveFreqRangeStartIndex: number;
  waveLinesToDisplay: number;
  waveNumberOfSamples: WaveNumberOfSamples;
  mirrorWave: boolean;
  durationInSeconds: number;
  audioOffsetInSeconds: number;
  transcriptUrl?: string;
  subtitlesTextColor?: string;
}

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