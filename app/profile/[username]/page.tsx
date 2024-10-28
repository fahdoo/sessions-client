import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Lora } from 'next/font/google';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { getBaseUrl } from '@/lib/server-utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
const lora = Lora({ subsets: ['latin'] });

const DynamicSessionFeed = dynamic(() => import('@/components/session/session-feed'), { ssr: false });

interface PageProps {
  params: {
    username: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = params;
  return {
    title: `${username}'s Public Sessions`,
    description: `View ${username}'s public sessions`,
  };
}

async function getUserInfo(username: string) {
  const response = await fetch(`${getBaseUrl()}/api/users/${username}`);
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = params;
  
  if (!username) {
    notFound();
  }

  const userInfo = await getUserInfo(username);

  if (!userInfo) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="relative h-[40vh] bg-slate-200 dark:bg-slate-800 rounded-b-3xl shadow-lg overflow-hidden">
        <BackButton />
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage 
            src={userInfo.avatar || '/default-avatar.png'} 
            alt={`${userInfo.firstName} ${userInfo.lastName}`} 
            className="object-cover"
          />
          <AvatarFallback className="text-6xl">
            {userInfo.firstName[0]}{userInfo.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
            {userInfo.firstName} {userInfo.lastName}
          </h1>
          <p className="text-base text-slate-200 drop-shadow-md">@{username}</p>
        </div>
      </div>

      <div className="px-2 py-4">
        <h3 className="font-semibold mb-4 px-2">Sessions</h3>
        <DynamicSessionFeed 
          fetchUrl={`/api/users/${username}/sessions`}
          showUser={false}
          showDuration={true}
          showSummary={false}
          isOwner={false}
        />
      </div>
    </div>
  );
}
