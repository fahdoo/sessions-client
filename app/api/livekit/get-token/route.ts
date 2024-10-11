import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roomName = searchParams.get('roomName');
  const username = searchParams.get('username');
  const metadata = searchParams.get('metadata') || '';
  console.log('Get Token', roomName, username, metadata);

  if (!roomName || !username) {
    return NextResponse.json({ error: 'Missing roomName or username parameter' }, { status: 400 });
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { 
    identity: username,
    ttl: '10m',
    metadata
  });

  at.addGrant({ 
    room: roomName, 
    roomJoin: true,  
    canPublish: true, 
    canSubscribe: true
  });
  const token = await at.toJwt();
  return NextResponse.json({ token });
}