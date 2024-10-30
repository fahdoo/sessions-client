import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export function getBaseUrl() {  
  // For preview/branch deployments
  if (process.env.VERCEL_ENV === 'preview') {
    // Use branch URL if available
    if (process.env.VERCEL_BRANCH_URL) {
      return `https://${process.env.VERCEL_BRANCH_URL}`;
    }
    // Fallback to the default preview URL
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // For production deployments without custom domain
  if (process.env.VERCEL_ENV === 'production') {
    return getProductionBaseUrl();
  }
  
  // For local development
  return 'http://localhost:3000';
}

export function getProductionBaseUrl() {
  // For production with custom domain
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return `https://${process.env.VERCEL_URL}`;
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
