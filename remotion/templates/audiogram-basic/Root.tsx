import '../../tailwind.css';
import { Composition } from "remotion";
import { AudioGramSchema, AudiogramComposition, fps } from "./Composition";
import "./style.css";

// Sample session data for development
const SAMPLE_SESSION = {
  audioUrl: "https://sessions-us-east-2.s3.us-east-2.amazonaws.com/audio/7d4d6bfb-0a44-48b7-bd42-96dfab97a62b/original.mp3",
  title: "My Test Session",
  user: {
    avatar: "https://avatars.githubusercontent.com/u/1234567?v=4",
    username: "testuser"
  },
  duration: 30
};

export const AudiogramBasicRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AudiogramBasic"
        component={AudiogramComposition}
        fps={fps}
        width={1080}
        height={1080}
        schema={AudioGramSchema}
        defaultProps={{
          audioFileName: SAMPLE_SESSION.audioUrl,
          coverImgFileName: SAMPLE_SESSION.user.avatar,
          titleText: `${SAMPLE_SESSION.title} with @${SAMPLE_SESSION.user.username}`,
          titleColor: "rgba(186, 186, 186, 0.93)",
          waveColor: "#a3a5ae",
          waveFreqRangeStartIndex: 7,
          waveLinesToDisplay: 29,
          waveNumberOfSamples: "256",
          mirrorWave: true,
          durationInSeconds: SAMPLE_SESSION.duration,
          audioOffsetInSeconds: 0,
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
