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
  return s3Url.replace(
    's3://',
    `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/`
  );
}

export function generateRoomName(sessionId: string) {
  return `room_${sessionId}`;
}

export const aiAgentNameMapping: Record<string, string> = {
  'ai-muse-v2': 'Muse',
  // Add more AI agent mappings here as needed
};

// Client-side base URL function
export function getClientBaseUrl() {
  return `${window.location.protocol}//${window.location.host}`;
}
