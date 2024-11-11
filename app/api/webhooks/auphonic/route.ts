import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';

// Define types for Auphonic API responses
interface AuphonicOutputFile {
  format: string;
  filename: string;
  download_url: string;
}

interface AuphonicService {
  type: string;
  transfer_success: boolean;
  bucket: string;
  key_prefix: string;
  result_urls: string[];
}

interface AuphonicWebhookData {
  uuid: string;
  status: string;
  status_string: string;
  error_message?: string;
}

interface ParsedFormData {
  uuid: string;
  status: string;
  status_string: string;
  error_message?: string;
  [key: string]: string | undefined; // Allow other string fields
}

/**
 * Fetches production details from Auphonic API
 * Called when we receive a 'Done' status to get:
 * - Processed file URLs
 * - Duration information
 * - Processing statistics
 * - S3 upload status
 */
async function getAuphonicProduction(uuid: string) {
  const response = await fetch(`https://auphonic.com/api/production/${uuid}.json`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(
        `${process.env.AUPHONIC_USERNAME}:${process.env.AUPHONIC_PASSWORD}`
      ).toString('base64')
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Auphonic production details');
  }

  const data = await response.json();
  // Log full production details for debugging
  console.log('Full Auphonic production details:', {
    uuid: data.data.uuid,
    status: data.data.status_string,
    input_file: data.data.input_file,
    output_files: data.data.output_files,
    outgoing_services: data.data.outgoing_services,
    external_services: data.data.external_services,
    service_urls: data.data.service_urls,
    length: data.data.length,
    length_timestring: data.data.length_timestring,
    raw: JSON.stringify(data, null, 2)
  });
  return data;
}

/**
 * Parses webhook data from Auphonic
 * Handles multiple content types:
 * - application/x-www-form-urlencoded: Initial status updates
 * - multipart/form-data: Final status with detailed info
 * 
 * Attempts to parse JSON values in case Auphonic sends structured data
 */
async function parseWebhookData(req: NextRequest): Promise<AuphonicWebhookData> {
  const contentType = req.headers.get('content-type') || '';
  const rawBody = await req.text();
  console.log('Parsing webhook data:', { contentType, rawBody });

  // Handle URL-encoded form data
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const params = new URLSearchParams(rawBody);
    const result: ParsedFormData = {
      uuid: '',
      status: '',
      status_string: ''
    };
    
    for (const [key, value] of params.entries()) {
      try {
        result[key] = JSON.parse(value);
      } catch {
        result[key] = value;
      }
    }
    
    return result as AuphonicWebhookData;
  }

  // Handle multipart form data
  if (contentType.includes('multipart/form-data')) {
    const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
    if (!boundary) {
      throw new Error('No boundary found in multipart form data');
    }

    const result: ParsedFormData = {
      uuid: '',
      status: '',
      status_string: ''
    };
    
    const parts = rawBody.split(`--${boundary}`);
    
    for (const part of parts) {
      const nameMatch = part.match(/name="([^"]+)"/);
      if (nameMatch) {
        const name = nameMatch[1];
        const value = part.split(/\r?\n\r?\n/)[1]?.trim();
        if (value && !value.includes('--')) {
          try {
            result[name] = JSON.parse(value);
          } catch {
            result[name] = value;
          }
        }
      }
    }
    
    return result as AuphonicWebhookData;
  }

  throw new Error(`Unsupported content type: ${contentType}`);
}

/**
 * Webhook handler for Auphonic status updates
 * 
 * Flow:
 * 1. Receive webhook from Auphonic
 * 2. Parse webhook data based on content type
 * 3. Find session by auphonic_uuid
 * 4. Handle different statuses:
 *    - Done: Get production details, update session with new audio URL
 *    - Error: Mark session as failed, keep original audio
 *    - Other: Log status for monitoring
 * 
 * Audio Processing:
 * - Original audio is in S3 at audio/[filename]
 * - Processed audio goes to audio-produced/[filename]
 * - URLs are stored in HTTPS format for direct access
 * - Duration is updated to reflect any silence removal
 */
export async function POST(req: NextRequest) {
  console.log('Auphonic webhook received:', {
    headers: Object.fromEntries(req.headers.entries()),
    method: req.method,
    url: req.url
  });

  try {
    const supabase = createServiceRoleSupabaseClient();
    
    // Parse webhook data based on content type
    const data = await parseWebhookData(req);
    console.log('Parsed webhook data:', data);

    // Find session by auphonic_uuid
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('id, audio_url')
      .eq('auphonic_uuid', data.uuid)
      .single();

    if (sessionError || !session) {
      console.error('Session not found for Auphonic UUID:', data.uuid);
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (data.status_string === 'Done') {
      // Get full production details including output files
      const production = await getAuphonicProduction(data.uuid);
      
      // Get the S3 service
      const s3Service = production.data.outgoing_services?.find(
        (service: AuphonicService) => service.type === 'amazons3' && service.transfer_success
      );

      if (!s3Service?.result_urls?.[0]) {
        throw new Error('No S3 URL found in Auphonic response');
      }

      // Convert HTTPS URL to S3 format
      const httpsUrl = s3Service.result_urls[0];
      const s3Url = `s3://${s3Service.bucket}/${s3Service.key_prefix}${production.data.output_basename}.${production.data.output_files[0].ending}`;
      
      const durationInSeconds = Math.floor(production.data.length);

      console.log('Processing complete:', {
        sessionId: session.id,
        originalDuration: production.data.input_length_timestring,
        newDuration: production.data.length_timestring,
        durationInSeconds,
        httpsUrl,
        s3Url
      });

      // Update session with S3 URL
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          audio_url: s3Url,
          audio_status: 'completed',
          duration: durationInSeconds,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (updateError) {
        console.error('Error updating session:', updateError);
        throw updateError;
      }

      return NextResponse.json({ 
        message: 'Session updated with processed audio',
        previousUrl: session.audio_url,
        newUrl: s3Url,
        duration: durationInSeconds
      });
    } else if (data.status_string === 'Error') {
      console.error('Auphonic processing error:', data.error_message);
      
      // Keep original audio URL but mark as failed
      const { error: updateError } = await supabase
        .from('sessions')
        .update({
          audio_status: 'processing_failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        message: 'Session marked as processing failed',
        error: data.error_message
      });
    }

    // For any other status, just acknowledge receipt
    return NextResponse.json({ 
      message: `Webhook received - status: ${data.status_string}` 
    });

  } catch (error) {
    console.error('Error processing Auphonic webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 