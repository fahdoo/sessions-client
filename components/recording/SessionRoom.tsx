import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useEffect, useCallback, useState } from 'react';
import { useMaybeRoomContext } from '@livekit/components-react';
import { TopicControls } from './TopicControls';
import { DataPacket_Kind } from 'livekit-client';

interface SessionRoomProps {
  token: string;
  roomName: string;
  transcript: string;
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
  transcript,
  onRoomConnected, 
  onRoomDisconnected,
  children 
}: SessionRoomProps) {
  const room = useMaybeRoomContext();
  const [messageStatus, setMessageStatus] = useState<{ [key: string]: 'sending' | 'success' | 'error' }>({});

  const handleTopicAction = useCallback(async (action: string, params?: { topic: string }) => {
    if (!room?.localParticipant) return;

    const topicKey = params?.topic || 'new';
    setMessageStatus(prev => ({ ...prev, [topicKey]: 'sending' }));

    try {
      const data = {
        action,
        params
      };

      const encoder = new TextEncoder();
      const bytes = encoder.encode(JSON.stringify(data));

      await room.localParticipant.publishData(bytes, {
        reliable: true,
        topic: 'agent-control'
      });

      setMessageStatus(prev => ({ ...prev, [topicKey]: 'success' }));
      
      // Clear success status after 2 seconds
      setTimeout(() => {
        setMessageStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[topicKey];
          return newStatus;
        });
      }, 2000);

    } catch (error) {
      console.error('Error sending topic action:', error);
      setMessageStatus(prev => ({ ...prev, [topicKey]: 'error' }));
    }
  }, [room]);

  return (
    <div className="relative h-full">
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
      
      <TopicControls 
        transcript={transcript}
        onTopicAction={handleTopicAction}
        messageStatus={messageStatus}
      />
    </div>
  );
} 