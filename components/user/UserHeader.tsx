import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from '@/lib/types';
import Link from 'next/link';

interface UserHeaderProps {
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  user?: User | null;
  timestamp?: string;
  isLink?: boolean;
}

export default function UserHeader({ 
  imageUrl, 
  firstName, 
  lastName, 
  username,
  user,
  timestamp,
  isLink 
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

  const content = (
    <div className="flex items-center gap-3">
      <Avatar className="h-12 w-12">
        <AvatarImage 
          src={avatarUrl || undefined} 
          alt={`${fName} ${lName}`.trim() || 'User'} 
        />
        <AvatarFallback>{getInitials()}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium text-slate-900 dark:text-slate-100">
          {`${fName} ${lName}`.trim() || 'Anonymous User'}
        </div>
        {uName && (
          <div className="text-sm text-slate-500 dark:text-slate-400">
            @{uName}
          </div>
        )}
        {timestamp && (
          <div className="text-xs text-slate-400 dark:text-slate-500">
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
