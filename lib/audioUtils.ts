import { convertS3UrlToHttps } from '@/lib/utils';

export const fetchAudioUrl = async (sessionId: string) => {
  if (!sessionId) {
    throw new Error("Session ID is missing");
  }

  const response = await fetch(`/api/sessions/${sessionId}/audio-url`);
  const data = await response.json();

  if (response.status === 202) {
    // Handle processing logic if needed
    throw new Error(data.message || "Audio processing in progress");
  } else if (response.ok) {
    return convertS3UrlToHttps(data.url);
  } else {
    throw new Error(data.error || response.statusText);
  }
};
