import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getServerBaseUrl } from '@/lib/server-utils';
import { Lora } from 'next/font/google';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
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
  const baseUrl = getServerBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/${username}`);
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

  const baseUrl = getServerBaseUrl();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="fixed top-0 left-0 right-0 bg-white dark:bg-slate-800 z-10 p-4 flex items-center">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className={`${lora.className} text-xl font-bold ml-4`}>Profile</h1>
      </div>
      <div className="pt-16 px-4 pb-6">
        <div className="mb-8 flex items-center">
          <Image
            src={userInfo.avatar || '/default-avatar.png'}
            alt={`${userInfo.firstName} ${userInfo.lastName}`}
            className="h-20 w-20 rounded-full mr-4"
            width={80}
            height={80}
          />
          <div>
            <h2 className={`${lora.className} text-2xl font-bold`}>
              {userInfo.firstName} {userInfo.lastName}
            </h2>
            <p className="text-sm text-slate-500">@{username}</p>
          </div>
        </div>
        <Button className="w-full mb-6">Follow</Button>
        <h3 className="text-xl font-semibold mb-4">Episodes</h3>
        <DynamicSessionFeed 
          fetchUrl={`${baseUrl}/api/users/${username}/sessions`}
          showUser={false}
          showDuration={true}
          showSummary={false}
          isOwner={false}
          layout="list"
        />
      </div>
    </div>
  );
}
