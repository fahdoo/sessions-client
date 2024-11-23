import '../../tailwind.css';
import { Composition } from "remotion";
import { AudiogramComposition, fps } from "./Composition";
import { VIDEO_FORMATS } from './types';

// Sample session data for development
const SAMPLE_SESSION = {
  audioUrl: "https://zamana-sessions-public.s3.us-east-2.amazonaws.com/samples/room_5eb0d793-b54d-4d6e-9786-337a2d883cf7-1731620594372.m4a",
  title: "Feline Bliss: The Unconditional Love of Gulab and Jamun",
  user: {
    avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yb2xZNlpVcnM4dVNVMjVxMXNLSUl6V0dZZmcifQ",
    username: "saniastani"
  },
  duration: 60,
  transcriptData: undefined  // Will be fetched by the API in production
};

export const AudiogramBasicRoot: React.FC = () => {
  return (
    <>
      {Object.entries(VIDEO_FORMATS).map(([format, config]) => (
        <Composition
          key={format}
          id={`Audiogram${format.charAt(0).toUpperCase() + format.slice(1)}`}
          component={AudiogramComposition}
          fps={fps}
          width={config.width}
          height={config.height}
          durationInFrames={SAMPLE_SESSION.duration * fps}
          defaultProps={{
            durationInSeconds: SAMPLE_SESSION.duration,
            audioOffsetInSeconds: 0,
            audioFileName: SAMPLE_SESSION.audioUrl,
            coverImgFileName: SAMPLE_SESSION.user.avatar,
            titleText: SAMPLE_SESSION.title,
            titleColor: "#cbd5e1",
            username: SAMPLE_SESSION.user.username,
            waveColor: "#64748b",
            waveFreqRangeStartIndex: 7,
            waveLinesToDisplay: 37,
            waveNumberOfSamples: "256",
            mirrorWave: true,
            transcriptData: SAMPLE_SESSION.transcriptData,
            subtitlesTextColor: "#cbd5e1",
          }}
        />
      ))}
    </>
  );
};
