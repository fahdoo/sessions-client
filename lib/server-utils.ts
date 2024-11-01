import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getBaseUrl() {
  // Priority 1: Custom domain if set
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  
  // Priority 2: Vercel deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Priority 3: Preview deployment URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  // Priority 4: Development environment
  return process.env.NODE_ENV === 'development' ? 
    'http://localhost:3000' : 
    'https://sessions-client.vercel.app'; // Fallback to production URL
}

// Helper for making server-side API calls
export async function serverFetch(path: string, options?: RequestInit) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  
  console.log('Making server fetch request:', {
    baseUrl,
    path,
    fullUrl: url,
    env: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    publicVercelUrl: process.env.NEXT_PUBLIC_VERCEL_URL,
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL
  });

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      'Content-Type': 'application/json',
    },
  });
}

export async function getSignedUrl(audioUrl: string) {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET is not configured');
  }

  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  // Extract the key from the audio URL
  // Handle both s3:// and https:// URLs
  let key = audioUrl;
  
  // Remove s3:// protocol and bucket name if present
  if (key.startsWith('s3://')) {
    key = key.replace(`s3://${process.env.AWS_S3_BUCKET}/`, '');
  }
  
  // Remove https:// URL if present
  if (key.includes('amazonaws.com/')) {
    key = key.split('amazonaws.com/')[1];
  }

  console.log('Original URL:', audioUrl);
  console.log('Extracted S3 key:', key);

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ResponseContentType: 'audio/ogg',
    ResponseContentDisposition: 'inline',
  });

  try {
    const signedUrl = await awsGetSignedUrl(s3, command, { 
      expiresIn: 3600,
    });
    console.log('Generated signed URL for key:', key);
    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', {
      error,
      key,
      bucket: process.env.AWS_S3_BUCKET,
      originalUrl: audioUrl
    });
    throw error;
  }
}

export const getSignedAudioUrl = (audioUrl: string) => getSignedUrl(audioUrl);
export const getSignedTranscriptUrl = (transcriptUrl: string) => getSignedUrl(transcriptUrl);
