import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserHeaderProps {
  imageUrl: string | null;
  firstName: string;
  lastName: string;
  username: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({ imageUrl, firstName, lastName, username }) => {
  return (
    <div className="relative h-[40vh] bg-slate-200 dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden mt-4">
      <div className="absolute top-4 left-4 z-20">
        {/* You can add a BackButton here if needed */}
      </div>
      <Avatar className="w-full h-full rounded-none">
        <AvatarImage 
          src={imageUrl || '/default-avatar.png'} 
          alt={`${firstName} ${lastName}`} 
          className="object-cover"
        />
        <AvatarFallback className="text-6xl">
          {firstName[0]}{lastName[0]}
        </AvatarFallback>
      </Avatar>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
          {firstName} {lastName}
        </h1>
        <p className="text-base text-slate-200 drop-shadow-md">@{username}</p>
      </div>
    </div>
  );
};

export default UserHeader;
