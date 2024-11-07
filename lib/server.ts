'use server';

import { auth } from '@clerk/nextjs/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getBaseUrl() {
  // Priority 1: Production environment
  if (process.env.NODE_ENV === 'production') {
    return 'https://sessional.ai';
  }
  
  // Priority 2: Vercel preview URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Priority 3: Custom domain if set (for testing/staging)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  
  // Priority 4: Development environment
  return 'http://localhost:3000';
}

// Helper for making server-side API calls
export async function serverFetch(path: string, options?: RequestInit) {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;
  const { getToken } = auth();
  
  try {
    // Get auth token if available
    const token = await getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });

    // Handle authentication errors
    if (response.status === 401) {
      throw new Error('Unauthorized: Please sign in');
    }

    // Handle other error responses
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    return response;

  } catch (error) {
    console.error('Server fetch error:', {
      url,
      error,
      env: process.env.NODE_ENV,
      baseUrl
    });
    throw error;
  }
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
    let key = audioUrl;
    
    // Remove s3:// protocol and bucket name if present
    if (key.startsWith('s3://')) {
      key = key.replace(`s3://${process.env.AWS_S3_BUCKET}/`, '');
    }
    
    // Remove https:// URL if present
    if (key.includes('amazonaws.com/')) {
      key = key.split('amazonaws.com/')[1];
    }
  
    // Determine content type based on file extension
    const fileExtension = key.split('.').pop()?.toLowerCase();
    let contentType: string;
  
    // Simplified content types without codecs
    switch (fileExtension) {
      case 'm4a':
        contentType = 'audio/x-m4a';  // More specific for Safari
        break;
      case 'aac':
        contentType = 'audio/aac';
        break;
      case 'ogg':
        contentType = 'audio/ogg';
        break;
      default:
        contentType = 'audio/mpeg';
    }
  
    console.log('Generating signed URL:', {
      originalUrl: audioUrl,
      extractedKey: key,
      fileExtension,
      contentType
    });
  
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      ResponseContentType: contentType,
      ResponseContentDisposition: 'inline',
    });
  
    try {
      const signedUrl = await awsGetSignedUrl(s3, command, { 
        expiresIn: 1800,
      });
      
      console.log('Generated signed URL for key:', {
        key,
        contentType,
        urlLength: signedUrl.length,
        // Log URL without query parameters for debugging
        baseUrl: signedUrl.split('?')[0]
      });
      
      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', {
        error,
        key,
        bucket: process.env.AWS_S3_BUCKET,
        originalUrl: audioUrl,
        contentType
      });
      throw error;
    }
  }
  
  export async function getSignedAudioUrl(audioUrl: string) {
    return await getSignedUrl(audioUrl);
  }
  
  export async function getSignedTranscriptUrl(transcriptUrl: string) {
    return await getSignedUrl(transcriptUrl);
  }
  