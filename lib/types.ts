export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
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
  audioUrl: string | null;
  audioStatus: string | null;
  transcriptStatus: string | null;
  systemPrompt: string | null;
  user: User;
}
