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
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('first_name, last_name, avatar, username')
    .eq('username', username)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
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
            alt={`${userInfo.first_name} ${userInfo.last_name}`}
            className="mx-auto mb-4 h-24 w-24 rounded-full"
          />
        )}
        <h1 className={`${lora.className} text-3xl font-bold`}>
          {userInfo.first_name} {userInfo.last_name}
        </h1>
        <p className="text-lg text-slate-400">Public Sessions</p>
      </div>
      <DynamicSessionFeed 
        fetchUrl={`${baseUrl}/api/users/${username}`}
        showUser={false}
        showDuration={false}
        showSummary={true}
        isOwner={false}
      />
    </div>
  );
}
