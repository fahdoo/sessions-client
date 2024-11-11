export type Learning = string;

export interface User {
  id: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  email?: string;
}

export interface Session {
  id: string;
  userId: string;
  title: string;
  summary: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string | null;
  isPublic: boolean;
  originalAudioUrl: string | null;
  audioUrl: string | null;
  audioStatus: string | null;
  transcriptUrl: string | null;
  transcriptStatus: string | null;
  systemPrompt: string | null;
  agentVariant: string | null;
  learnings?: Learning[];
  user?: User;
}

export type TranscriptStatus = 
  | 'pending'        // Initial state when session is created
  | 'recording'      // Actively recording/receiving transcripts
  | 'processing'     // Processing completed recording
  | 's3_only'        // Stored in S3 but not in database (legacy)
  | 'db_synced'      // Stored in both S3 and database
  | 'completed'      // Final state, fully processed and stored
  | 'failed';        // Failed to process or store

export interface TranscriptSegment {
  id: string;
  participantId: string;
  text: string;
  startTime: number;
  endTime: number;
  language: string;
  isFinal: boolean;
  firstReceivedTime?: number;
  lastReceivedTime?: number;
}

interface Participant {
  id: string;
  name?: string;
}

export type TranscriptState = {
  metadata: {
    sessionId: string;
    startTime: string;
    endTime: string;
    participants: Participant[];
  };
  transcript: TranscriptSegment[];
};

export type NextError = Error & {
  digest?: string;
};

export interface VideoExportOptions {
  format: 'webm' | 'mp4';
  quality: 'low' | 'medium' | 'high';
  fps: number;
  filename?: string;
}
