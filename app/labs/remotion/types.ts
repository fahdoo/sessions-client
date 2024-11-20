export interface Session {
  id: string;
  title: string;
  created_at: string;
  audio_url: string;
  duration: number | null;
  transcript_url: string;
  user: {
    avatar: string;
    username: string;
  };
} 