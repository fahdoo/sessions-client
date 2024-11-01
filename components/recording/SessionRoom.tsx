import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect } from 'react';
import { useMaybeRoomContext } from '@livekit/components-react';

interface SessionRoomProps {
  token: string;
  roomName: string;
  onRoomConnected: (roomName: string) => void;
  onRoomDisconnected: () => void;
  children: React.ReactNode;
}

function RoomEventHandler({ roomName, onConnected, onDisconnected }: { 
  roomName: string;
  onConnected: (roomName: string) => void;
  onDisconnected: () => void;
}) {
  const room = useMaybeRoomContext();

  useEffect(() => {
    if (!room) return;

    const handleConnected = () => onConnected(roomName);
    const handleDisconnected = () => onDisconnected();

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);

    return () => {
      room.off(RoomEvent.Connected, handleConnected);
      room.off(RoomEvent.Disconnected, handleDisconnected);
    };
  }, [room, roomName, onConnected, onDisconnected]);

  return null;
}

export function SessionRoom({ 
  token, 
  roomName, 
  onRoomConnected, 
  onRoomDisconnected,
  children 
}: SessionRoomProps) {
  return (
    <LiveKitRoom
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      connect={true}
      audio={true}
      video={false}
      className="flex-1 flex flex-col bg-slate-900"
    >
      <RoomEventHandler 
        roomName={roomName}
        onConnected={onRoomConnected}
        onDisconnected={onRoomDisconnected}
      />
      {children}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
} 