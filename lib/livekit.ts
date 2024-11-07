import { RoomServiceClient } from 'livekit-server-sdk';

const livekitServerUrl = process.env.LIVEKIT_SERVER_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!livekitServerUrl || !apiKey || !apiSecret) {
  throw new Error(`LiveKit configuration is incomplete: ${JSON.stringify({ livekitServerUrl, apiKey: apiKey ? 'set' : 'not set', apiSecret: apiSecret ? 'set' : 'not set' })}`);
}

const roomService = new RoomServiceClient(livekitServerUrl, apiKey, apiSecret);

export async function createRoom(name: string, metadata: string) {
  try {
    console.log('Creating LiveKit room:', { name, metadata, livekitServerUrl });
    const room = await roomService.createRoom({
      name,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 2,
      metadata: metadata
    });
    console.log('LiveKit room created successfully:', room);
    return room;
  } catch (error) {
    console.error('Error creating LiveKit room:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
    throw error;
  }
}

export function generateRoomName(sessionId: string) {
  return `room_${sessionId}`;
}
