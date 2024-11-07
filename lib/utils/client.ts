import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// UI Utilities
export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return twMerge(clsx(inputs))
}

// Client-side URL
export function getClientBaseUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}

// Session Management
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

// Browser Interactions
export function confirmAction(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const isConfirmed = window.confirm(message);
    resolve(isConfirmed);
  });
}

// AI Agent Utilities
export const aiAgentNameMapping: { [key: string]: string } = {
  'ai-muse': 'Muse',
};

export const isAIAgent = (participantId: string): boolean => {
  return participantId.startsWith('agent-') || 
         participantId.startsWith('ai-') || 
         Object.keys(aiAgentNameMapping).includes(participantId);
};

export function convertS3UrlToHttps(s3Url: string): string {
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    
    if (!s3Url.startsWith('s3://')) {
      return s3Url; // Already in HTTPS format or invalid
    }
  
    const key = s3Url.replace(`s3://${bucketName}/`, '');
    return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
  } 
  