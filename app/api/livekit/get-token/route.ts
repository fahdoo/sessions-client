import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { getAuth } from '@clerk/nextjs/server';
import { generateRoomName } from '@/lib/utils';

export async function GET(req: NextRequest) {
  console.log('GET /api/livekit/get-token route hit');
  const { userId } = getAuth(req);
  if (!userId) {
    console.error('Unauthorized: No userId found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    console.error('Bad Request: No sessionId provided');
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error('Server misconfiguration: LiveKit API key or secret missing');
      throw new Error('LiveKit API key or secret is not configured');
    }

    const at = new AccessToken(apiKey, apiSecret, { identity: userId });
    at.addGrant({ 
      room: generateRoomName(sessionId),
      roomJoin: true,
      canPublish: true,
      canSubscribe: true
    });

    const token = await at.toJwt();
    console.log('LiveKit token generated successfully');
    return NextResponse.json({ token });
  } catch (error: unknown) {
    console.error('Error generating LiveKit token:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to generate token', details: errorMessage }, { status: 500 });
  }
}
