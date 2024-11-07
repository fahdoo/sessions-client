import { serverFetch } from '@/lib/server';

export type Learning = string;

export async function extractLearnings(transcript: string): Promise<Learning[]> {
  try {
    const response = await serverFetch('/api/extract-learnings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to extract learnings: ${response.status}`);
    }

    const data = await response.json();
    return data.learnings || [];
  } catch (error) {
    console.error('Learnings extraction error:', error);
    return [];
  }
} 