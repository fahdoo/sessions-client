# LiveKit Cloud Audio Recording and Real-Time Transcription Documentation

## Overview

This documentation covers using LiveKit Cloud for:
- Recording audio from LiveKit rooms
- Generating real-time transcriptions
- Storing audio recordings and transcriptions securely

## Key Components

1. **LiveKit Cloud Egress**: For audio recording
2. **LiveKit Transcription**: For real-time transcription on the client-side
3. **Supabase Storage**: For storing audio files and transcripts

## Real-Time Transcription

LiveKit provides real-time transcription capabilities on the client-side. There's no need to enable any special settings in LiveKit Cloud for transcription.

### Client-Side Integration

To use real-time transcription in your React application:

1. Install the necessary packages:

```bash
npm install livekit-client @livekit/components-react
```

2. Use the `useTrackTranscription` hook in your React component:

```typescript
import { useTrackTranscription } from '@livekit/components-react';
import { Track } from 'livekit-client';

function TranscriptionComponent({ track }: { track: Track }) {
  const transcription = useTrackTranscription(track);

  return (
    <div>
      <h3>Real-time Transcription</h3>
      <p>{transcription}</p>
    </div>
  );
}
```

3. Implement the transcription in your main component:

```typescript
import { useRoom, useLocalParticipant, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';

function RoomComponent() {
  const room = useRoom();
  const { localParticipant } = useLocalParticipant();
  const tracks = useTracks();

  // Find the first audio track
  const audioTrack = tracks.find(track => track.kind === Track.Kind.Audio);

  return (
    <div>
      {audioTrack && <TranscriptionComponent track={audioTrack} />}
    </div>
  );
}
```

## Audio Recording Process

### Starting a Recording

Use the LiveKit Server SDK to start an audio recording:

```typescript
import { EgressClient } from 'livekit-server-sdk';

const egressClient = new EgressClient(
  'https://your-livekit-cloud-domain.livekit.cloud',
  'your-api-key',
  'your-api-secret'
);

async function startRecording(roomName: string) {
  const result = await egressClient.startRoomCompositeEgress(roomName, {
    file: {
      filepath: `${roomName}-${Date.now()}.mp4`,
    },
    options: {
      audioOnly: true,
      audioConfig: {
        channels: 1,  // Mono audio
        sampleRate: 16000,  // 16 kHz sample rate
        bitrate: 64000,  // 64 kbps bitrate
      },
    },
  });

  console.log('Audio recording started:', result.egressId);
  return result.egressId;
}
```

### Stopping the Recording

To stop the recording:

```typescript
async function stopRecording(egressId: string) {
  await egressClient.stopEgress(egressId);
  console.log('Recording stopped');
}
```

### Handling Egress Events

Set up a webhook handler to receive LiveKit Cloud egress status events:

```typescript
import express from 'express';
import { WebhookReceiver } from 'livekit-server-sdk';

const app = express();
const receiver = new WebhookReceiver('your-api-key', 'your-api-secret');

app.post('/webhooks/livekit', express.json(), async (req, res) => {
  const event = await receiver.receive(req.body, req.get('Authorization'));
  
  if (event.event === 'egress_started') {
    console.log('Recording started:', event.egressInfo?.egressId);
  } else if (event.event === 'egress_ended') {
    console.log('Recording ended:', event.egressInfo?.egressId);
    // Handle completed recording
    await handleCompletedRecording(event.egressInfo);
  }

  res.sendStatus(200);
});
```

## Storing Audio Recordings and Transcripts with Supabase Storage

After the recording is complete, store the audio file in Supabase. For transcripts, you might want to periodically save the real-time transcriptions or save a final version when the session ends.

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');

async function uploadToSupabase(filePath: string, bucket: string, fileName: string, contentType: string) {
  const fileContent = await fs.promises.readFile(filePath);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileContent, { contentType });

  if (error) {
    console.error(`Error uploading to ${bucket}:`, error);
    throw error;
  }

  console.log(`File uploaded successfully to ${bucket}/${fileName}`);
  return data;
}

async function handleCompletedRecording(egressInfo: any) {
  if (egressInfo.status === 'EGRESS_COMPLETED') {
    // Upload audio file
    const audioFileName = `${egressInfo.roomName}-${Date.now()}.mp4`;
    await uploadToSupabase(egressInfo.file?.filename, 'sessions_audio', audioFileName, 'audio/mp4');
  }
}

async function saveTranscript(roomName: string, transcript: string) {
  const transcriptFileName = `${roomName}-${Date.now()}.txt`;
  await supabase.storage
    .from('sessions_transcripts')
    .upload(transcriptFileName, transcript, { contentType: 'text/plain' });
}
```

Remember to replace placeholder values (like 'YOUR_SUPABASE_URL', 'your-api-key', etc.) with your actual LiveKit Cloud and Supabase credentials.

Always refer to the latest LiveKit Cloud and Supabase documentation for the most up-to-date information on features and best practices.