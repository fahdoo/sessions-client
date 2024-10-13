# Transcript Design for Sessions App

## Overview

We'll use a JSON structure for storing transcripts, aligning with LiveKit's transcription system. This approach provides structured and flexible data, allowing for real-time updates and comprehensive metadata storage.

## JSON Structure for Transcripts

```json
{
  "metadata": {
    "sessionId": "unique-session-id",
    "startTime": "2023-06-15T14:30:00Z",
    "endTime": "2023-06-15T15:00:00Z",
    "participants": [
      {
        "id": "participant-id-1",
        "name": "John Doe",
        "type": "human"
      },
      {
        "id": "ai-muse-v2",
        "name": "AI Interviewer",
        "type": "ai"
      }
    ]
  },
  "transcript": [
    {
      "id": "segment-id-1",
      "participantId": "participant-id-1",
      "text": "Hello, it's great to be here today.",
      "startTime": 1000,
      "endTime": 3500,
      "language": "en-US",
      "isFinal": true
    },
    {
      "id": "segment-id-2",
      "participantId": "ai-muse-v2",
      "text": "Welcome! Let's start with your first question.",
      "startTime": 4000,
      "endTime": 7000,
      "language": "en-US",
      "isFinal": true
    }
  ]
}
```

## Breakdown of JSON Structure

1. `metadata`: Contains session-level information
   - `sessionId`: Unique identifier for the session
   - `startTime`: ISO 8601 timestamp for session start
   - `endTime`: ISO 8601 timestamp for session end
   - `participants`: Array of participant objects with their IDs, names, and types
     - `id`: Unique identifier for the participant (e.g., "participant-id-1" for humans, "ai-muse-v2" for AI)
     - `name`: Display name of the participant
     - `type`: Type of participant ("human" or "ai")

2. `transcript`: Array of transcript segments
   - `id`: Unique identifier for the segment
   - `participantId`: ID of the participant speaking (matches the `id` in the participants array)
   - `text`: Transcribed text for this segment
   - `startTime`: Start time of the segment in milliseconds from the beginning of the session
   - `endTime`: End time of the segment in milliseconds from the beginning of the session
   - `language`: The detected language of the speech (e.g., "en-US")
   - `isFinal`: Boolean indicating if this is the final version of the transcription for this segment

## Benefits of This Structure

1. **Real-time Updates**: The `isFinal` flag allows for real-time updates of the transcript as the conversation progresses.
2. **Speaker Identification**: Each segment is linked to a specific participant, allowing for easy speaker identification.
3. **Timing Information**: Precise timing for each segment enables accurate playback synchronization with audio.
4. **Metadata**: Session-level metadata provides context for the entire transcript.
5. **AI Agent Flexibility**: Separate `id` and `type` fields allow for different AI agents while maintaining clear identification.

## Implementation Considerations

1. **Storage**: Store the JSON file in S3 with MIME type `application/json`.
2. **Real-time Processing**: Implement a system to update the transcript in real-time as new segments are received.
3. **Final Processing**: Once the session ends, process all segments to ensure they are marked as final and compile the complete transcript.
4. **Rendering**: Develop a component that can render the transcript, possibly highlighting the current segment during playback.
5. **AI Agent Identification**: When processing transcripts, check for the `type` field to identify AI-generated speech, and use the `id` for specific AI agent identification.
6. **UI Differentiation**: Consider using different styles or icons for different types of AI agents in the transcript display.
7. **Timing for AI Speech**: Since AI doesn't have a traditional audio stream, you may need to estimate or approximate start and end times for AI-generated segments.

## API Endpoints

Update the following API endpoints to work with this transcript structure:

1. GET `/api/sessions/[id]/transcript`: 
   - Return the full JSON structure if the transcript is complete.
   - For in-progress sessions, return the current state of the transcript.
   - Include the AI agent information in the participants list.

2. POST `/api/sessions/[id]/transcript`:
   - Accept new transcript segments and update the stored JSON structure.
   - Handle both interim and final transcriptions.
   - For AI-generated speech, use the "ai-agent" participantId.

## UI Considerations

1. **Real-time Display**: Show transcripts as they are being generated, with interim transcriptions in a different style (e.g., italics).
2. **Speaker Identification**: Use different colors or styles for different speakers, with a distinct style for the AI agent.
3. **Timestamp Display**: Optionally show timestamps for each segment, including estimated times for AI-generated speech.
4. **Editing Interface**: Provide an interface for users to edit the transcript post-session, maintaining the structured format and special handling for AI-generated content.

## Potential Challenges

- **Size**: JSON is more verbose than plain text, which may require more storage for very large transcripts.
- **Processing**: More logic is needed to parse and render JSON into a human-readable format, especially when showing speaker changes and timestamps.

This design accommodates the unique nature of the AI agent in our Sessions app while maintaining a structured and detailed transcript format. It allows for clear differentiation between human and AI-generated speech, enabling more nuanced display and processing of the transcript data.
