import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface UserHeaderProps {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  user?: User | null;
  timestamp?: string;
  isLink?: boolean;
  size?: 'sm' | 'md' | 'lg' | number;
  shape?: 'square' | 'circle';
}

export default function UserHeader({ 
  imageUrl, 
  firstName, 
  lastName, 
  username,
  user,
  timestamp,
  isLink,
  size = 96,
  shape = 'square'
}: UserHeaderProps) {
  const avatarUrl = imageUrl || user?.avatar;
  const fName = firstName || user?.firstName || '';
  const lName = lastName || user?.lastName || '';
  const uName = username || user?.username;

  const getInitials = () => {
    const f = fName.charAt(0);
    const l = lName.charAt(0);
    return f || l ? `${f}${l}` : '?';
  };

  const sizeInPixels = typeof size === 'number' 
    ? size 
    : size === 'sm' ? 48
    : size === 'md' ? 64
    : size === 'lg' ? 96
    : 32;

  const content = (
    <div className="flex flex-col items-center gap-2">
      <Avatar 
        style={{ width: `${sizeInPixels}px`, height: `${sizeInPixels}px` }}
        className={cn(
          shape === 'square' ? 'rounded-lg' : 'rounded-full'
        )}
      >
        <AvatarImage 
          src={avatarUrl || undefined} 
          alt={`${fName} ${lName}`.trim() || 'User'} 
          className={shape === 'square' ? 'rounded-lg' : 'rounded-full'}
        />
        <AvatarFallback className={shape === 'square' ? 'rounded-lg' : 'rounded-full'}>
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col items-center">
        <div className="font-medium text-sm text-white">
          {`${fName} ${lName}`.trim() || 'Anonymous User'}
        </div>
        {uName && (
          <div className="text-xs text-slate-300">
            @{uName}
          </div>
        )}
        {timestamp && (
          <div className="text-xs text-slate-300">
            {new Date(timestamp).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );

  if (isLink && uName) {
    return (
      <Link href={`/profile/${uName}`} className="hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
