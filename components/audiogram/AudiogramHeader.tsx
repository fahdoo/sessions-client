import { Radar } from 'lucide-react';
import Image from 'next/image';

interface AudiogramHeaderProps {
  username: string;
  avatarUrl: string | null | undefined;
}

export function AudiogramHeader({ username, avatarUrl }: AudiogramHeaderProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white z-10">
      <div className="flex items-center gap-2">
        <Radar className="w-6 h-6" />
        <span className="font-medium">Sessions</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">@{username}</span>
        {avatarUrl && (
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={avatarUrl}
              alt={username}
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
} 