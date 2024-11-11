import { getBaseUrl } from '@/lib/server';

interface AuphonicMetadata {
  title: string;
  [key: string]: string;
}

interface AuphonicData {
  uuid: string;
  status: number;
  status_string: string;
  output_files: Array<{
    format: string;
    filename: string;
    download_url: string;
  }>;
  length: number;
  length_timestring: string;
}

interface AuphonicResponse {
  status_code: number;
  data: AuphonicData;
}

/**
 * Downloads file from S3 and uploads to Auphonic
 * @param url - HTTPS URL to the audio file
 * @returns Uploaded file URL from Auphonic
 */
async function uploadToAuphonic(url: string): Promise<string> {
  // First download the file
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to download audio file');
  
  const blob = await response.blob();
  const formData = new FormData();
  formData.append('file', blob);

  // Upload to Auphonic
  const uploadResponse = await fetch('https://auphonic.com/api/upload.json', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.AUPHONIC_USERNAME}:${process.env.AUPHONIC_PASSWORD}`
      ).toString('base64')
    },
    body: formData
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.json();
    throw new Error(`Auphonic upload error: ${error.error_message || uploadResponse.statusText}`);
  }

  const data = await uploadResponse.json();
  return data.data.url;
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
 * @param audioUrl - Original audio file location in our S3 bucket
 * @param title - Session title for metadata
 * @returns Auphonic UUID for tracking the processing job
 */
export async function startAuphonicProcessing(audioUrl: string, title: string): Promise<string> {
  console.log('Starting Auphonic processing:', {
    audioUrl,
    title
  });

  // Convert to proper S3 URL format with region
  const region = process.env.AWS_REGION || 'us-east-2';
  const auphonicUrl = audioUrl.replace(
    'https://zamana-sessions-dev.s3.amazonaws.com/',
    `https://zamana-sessions-dev.s3.${region}.amazonaws.com/`
  );

  console.log('Using Auphonic URL:', auphonicUrl);

  // Get base URL for webhooks
  const baseUrl = process.env.NEXT_PUBLIC_WEBHOOK_PROXY_URL || await getBaseUrl();
  const webhookUrl = `${baseUrl}/api/webhooks/auphonic`;
  
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
      preset: process.env.AUPHONIC_PRESET_UUID,
      input_file: auphonicUrl,
      metadata: { title },
      webhook: webhookUrl,
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