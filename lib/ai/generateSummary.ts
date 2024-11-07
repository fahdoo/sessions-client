import { serverFetch } from '@/lib/server';
export async function generateSummary(transcript: string): Promise<string | null> {
  try {
    const response = await serverFetch('/api/generate-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.status}`);
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Summary generation error:', error);
    return null;
  }
} 