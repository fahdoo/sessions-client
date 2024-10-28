import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return twMerge(clsx(inputs))
}

// Helper function to handle BigInt serialization
export function bigIntToStringReplacer(value: string | number | boolean | null | object | bigint): string | number | boolean | null | object {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

// Utility function to convert S3 URL to HTTPS
export function convertS3UrlToHttps(s3Url: string): string {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION;
  
  if (!s3Url.startsWith('s3://')) {
    return s3Url; // Already in HTTPS format or invalid
  }

  const key = s3Url.replace(`s3://${bucketName}/`, '');
  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
}

export function generateRoomName(sessionId: string) {
  return `room_${sessionId}`;
}

export const aiAgentNameMapping: { [key: string]: string } = {
  'ai-muse': 'Muse',
  // Add any other known AI agent IDs here
};

export const isAIAgent = (participantId: string): boolean => {
  return participantId.startsWith('agent-') || participantId.startsWith('ai-') || Object.keys(aiAgentNameMapping).includes(participantId);
};

// Client-side base URL function
export function getClientBaseUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

// New function to create a session
export async function createNewSession(title: string, systemPrompt?: string): Promise<{ id: string }> {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, systemPrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Server response:', errorData);
    throw new Error(`Failed to create new session: ${errorData.error || response.statusText}`);
  }

  return await response.json();
}

// New utility function for confirmation dialog
export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isConfirmed = window.confirm(message);
    resolve(isConfirmed);
  });
}

// New utility function for date formatting
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Add this to your existing utils file
export function formatDuration(seconds: number): string {
  // Round to nearest minute
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}
