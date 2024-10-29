import { convertS3UrlToHttps } from '@/lib/utils';

export const fetchAudioUrl = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is missing");
  }

  try {
    const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Failed to fetch audio (${response.status})`);
    }

    if (response.status === 202) {
      throw new Error(data.message || "Audio processing in progress");
    }

    if (!data.url) {
      throw new Error("No audio URL returned from server");
    }

    return convertS3UrlToHttps(data.url);
  } catch (error) {
    console.error('Audio fetch error:', error);
    throw error;
  }
};
