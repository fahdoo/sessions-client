import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/supabase-service-role';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get headers
    const headersList = headers();
    const status = headersList.get('x-remotion-status');
    const mode = headersList.get('x-remotion-mode');
    const signature = headersList.get('x-remotion-signature');

    console.log('Webhook headers:', { status, mode, signature });

    // Handle empty body for timeout case
    if (status === 'timeout') {
      // Extract renderId from signature (it's in the URL that was signed)
      const signatureParts = signature?.split('=');
      const renderId = signatureParts?.[1]?.split('/')[0];
      
      if (renderId) {
        console.log('Handling timeout for renderId:', renderId);
        const supabase = createServiceRoleSupabaseClient();
        await supabase
          .from('videos')
          .update({
            status: 'timeout',
            updated_at: new Date().toISOString()
          })
          .eq('render_id', renderId);

        return NextResponse.json({ success: true });
      }
    }

    // Get raw body for non-timeout cases
    const rawBody = await request.text();
    console.log('Raw webhook body:', rawBody);

    // Only try to parse if we have a body
    if (!rawBody) {
      console.log('Empty webhook body received');
      return NextResponse.json({ success: true });
    }

    // Parse body
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Failed to parse webhook body:', parseError);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('Webhook payload:', body);

    // Handle different webhook types based on payload
    if (body.type === 'success') {
      const { renderId, outputUrl } = body;
      console.log('Render succeeded:', { renderId, outputUrl });

      // Update video record in database with the direct outputUrl
      const supabase = createServiceRoleSupabaseClient();
      await supabase
        .from('videos')
        .update({
          status: 'completed',
          video_url: outputUrl,
          updated_at: new Date().toISOString()
        })
        .eq('render_id', renderId);

      console.log('Video record updated successfully');

    } else if (body.type === 'error') {
      const { renderId, errors } = body;
      console.error('Render failed:', { renderId, errors });

      const supabase = createServiceRoleSupabaseClient();
      await supabase
        .from('videos')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString()
        })
        .eq('render_id', renderId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
} 