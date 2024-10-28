import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Lora } from 'next/font/google';
import { getBaseUrl } from '@/lib/server-utils';
import UserHeader from '@/components/user/UserHeader'; // Import the new UserHeader component

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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-4">
        <UserHeader 
          imageUrl={userInfo.avatar} 
          firstName={userInfo.firstName} 
          lastName={userInfo.lastName} 
          username={username} 
        />
        <div className="py-6">
          <h3 className="font-semibold mb-4 text-slate-500">Sessions</h3>
          <DynamicSessionFeed 
            fetchUrl={`/api/users/${username}/sessions`}
            showUser={false}
            showDuration={true}
            showSummary={true}
            showAudioPlayer={true}
            isOwner={false}
          />
        </div>
      </div>
    </div>
  );
}
