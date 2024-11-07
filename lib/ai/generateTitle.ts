import { serverFetch } from '@/lib/server';

export async function generateTitle(transcript: string, originalTitle: string, sessionId?: string): Promise<string> {
  try {
    const response = await serverFetch('/api/generate-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, originalTitle, sessionId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate title: ${response.status}`);
    }

    const data = await response.json();
    return data.title || originalTitle;
  } catch (error) {
    console.error('Title generation error:', error);
    return originalTitle;
  }
} 