export async function generateTitle(transcript: string, originalTitle: string, sessionId?: string): Promise<string> {
  const response = await fetch('/api/generate-title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript, originalTitle, sessionId }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate title');
  }

  const data = await response.json();
  return data.title;
}
