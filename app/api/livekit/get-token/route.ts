import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const roomName = searchParams.get('roomName');
  const userId = searchParams.get('userId');

  if (!roomName || !userId) {
    return NextResponse.json({ error: 'Missing roomName or userId parameter' }, { status: 400 });
  }

  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { 
    identity: userId 
  });

  at.addGrant({ roomJoin: true, room: roomName });
  const token = await at.toJwt();
  return NextResponse.json({ token });
}