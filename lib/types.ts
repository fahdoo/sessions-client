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
  isPublic: boolean;
  audioUrl: string;
  user: User;
  roomName?: string;
  systemPrompt: string;
}
