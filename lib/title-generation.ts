import { serverFetch } from './server-utils';

export async function generateTitle(transcript: string, originalTitle: string, sessionId?: string): Promise<string> {
  const response = await serverFetch('/api/generate-title', {
    method: 'POST',
    body: JSON.stringify({ transcript, originalTitle, sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Title generation failed:', errorData);
    throw new Error(errorData.error || 'Failed to generate title');
  }

  const data = await response.json();
  
  // Make sure we have a valid title before returning
  if (!data.title) {
    console.error('No title in response:', data);
    throw new Error('No title received from server');
  }
  
  return data.title;
}
