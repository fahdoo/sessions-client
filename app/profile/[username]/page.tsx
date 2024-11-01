import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Lora } from 'next/font/google';
import { getBaseUrl } from '@/lib/server-utils';
import UserHeader from '@/components/user/UserHeader';

const lora = Lora({ subsets: ['latin'] });

const DynamicSessionFeed = dynamic(() => import('@/components/session/feed/SessionFeed'), { ssr: false });

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
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/users/${username}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch user: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.username) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = params;
  
  if (!username || typeof username !== 'string') {
    notFound();
  }

  const userInfo = await getUserInfo(username.toLowerCase());

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
          username={userInfo.username}
        />
        <div className="py-6">
          <DynamicSessionFeed 
            fetchUrl={`/api/users/${userInfo.username}/sessions`}
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
