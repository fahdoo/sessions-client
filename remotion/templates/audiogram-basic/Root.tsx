import '../../tailwind.css';
import { Composition } from "remotion";
import { AudioGramSchema, AudiogramComposition, fps } from "./Composition";
import "./style.css";

// Sample session data for development
const SAMPLE_SESSION = {
  audioUrl: "https://zamana-sessions-public.s3.us-east-2.amazonaws.com/samples/room_5eb0d793-b54d-4d6e-9786-337a2d883cf7-1731620594372.m4a",
  title: "Feline Bliss: The Unconditional Love of Gulab and Jamun",
  user: {
    avatar: "https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yb2xZNlpVcnM4dVNVMjVxMXNLSUl6V0dZZmcifQ",
    username: "saniastani"
  },
  transcriptUrl: "https://zamana-sessions-public.s3.us-east-2.amazonaws.com/samples/room_5eb0d793-b54d-4d6e-9786-337a2d883cf7-1731620594372.json",
  duration: 60
};

export const AudiogramBasicRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AudiogramBasic"
        component={AudiogramComposition}
        fps={30}
        width={1080}
        height={1080}
        schema={AudioGramSchema}
        defaultProps={{
          audioFileName: SAMPLE_SESSION.audioUrl,
          coverImgFileName: SAMPLE_SESSION.user.avatar,
          titleText: SAMPLE_SESSION.title,
          titleColor: "#cbd5e1",
          username: SAMPLE_SESSION.user.username,
          waveColor: "#64748b",
          waveFreqRangeStartIndex: 7,
          waveLinesToDisplay: 29,
          waveNumberOfSamples: "256",
          mirrorWave: true,
          durationInSeconds: SAMPLE_SESSION.duration,
          audioOffsetInSeconds: 0,
          transcriptUrl: SAMPLE_SESSION.transcriptUrl,
          subtitlesTextColor: "#cbd5e1",
        }}
        calculateMetadata={({ props }) => {
          return {
            durationInFrames: props.durationInSeconds * fps,
            props,
          };
        }}
      />
    </>
  );
};
