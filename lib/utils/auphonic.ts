import { convertS3UrlToHttps } from './client';
import { getBaseUrl } from '@/lib/server';

interface AuphonicResponse {
  status_code: number;
  data: {
    uuid: string;
    [key: string]: any;
  };
}

/**
 * Initiates audio post-processing with Auphonic
 * 
 * Workflow:
 * 1. Convert S3 URL to HTTPS for Auphonic to access
 * 2. Set up webhook URL for status updates
 * 3. Start processing with Auphonic using preset algorithms
 * 4. Return UUID for tracking the processing job
 * 
 * The process will:
 * - Remove background noise
 * - Normalize audio levels
 * - Remove silences and fillers
 * - Convert to AAC format
 * - Upload back to our S3 bucket in audio-produced/
 * 
 * @param s3Url - Original audio file location in our S3 bucket
 * @param title - Session title for metadata
 * @returns Auphonic UUID for tracking the processing job
 */
export async function startAuphonicProcessing(s3Url: string, title: string): Promise<string> {
  // Convert S3 URL to HTTPS for external access
  const audioUrl = convertS3UrlToHttps(s3Url);
  
  // Get base URL for webhooks (use proxy URL in development)
  const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL || await getBaseUrl();
  const webhookUrl = `${baseUrl}/api/webhooks/auphonic`;
  
  console.log('Starting Auphonic processing:', {
    audioUrl,
    webhookUrl,
    title
  });
  
  // Start processing with Auphonic
  const response = await fetch('https://auphonic.com/api/productions.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.AUPHONIC_USERNAME}:${process.env.AUPHONIC_PASSWORD}`
      ).toString('base64')
    },
    body: JSON.stringify({
      preset: process.env.AUPHONIC_PRESET_UUID, // Preset includes noise reduction, normalization settings
      input_file: audioUrl,
      metadata: { title },
      webhook: webhookUrl, // Auphonic will POST status updates here
      action: "start"
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Auphonic API error: ${error.error_message || response.statusText}`);
  }

  const data = await response.json() as AuphonicResponse;
  console.log('Auphonic response:', data);
  return data.data.uuid;
} 