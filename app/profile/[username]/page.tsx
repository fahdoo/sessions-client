import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import dynamic from 'next/dynamic';
import { getServerBaseUrl } from '@/lib/server-utils';
import { Lora } from 'next/font/google';

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        {userInfo.avatar && (
          <img
            src={userInfo.avatar}
            alt={`${userInfo.firstName} ${userInfo.lastName}`}
            className="mx-auto mb-4 h-24 w-24 rounded-full"
          />
        )}
        <h1 className={`${lora.className} text-3xl font-bold`}>
          {userInfo.firstName} {userInfo.lastName}
        </h1>
        <p className="text-lg text-slate-400">Public Sessions</p>
      </div>
      <DynamicSessionFeed 
        fetchUrl={`${baseUrl}/api/users/${username}/sessions`}
        showUser={false}
        showDuration={false}
        showSummary={true}
        isOwner={false}
      />
    </div>
  );
}
