import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { Session } from '@/lib/types';
import dynamic from 'next/dynamic';
import { getServerBaseUrl } from '@/lib/server-utils';

const DynamicSessionCard = dynamic(() => import('@/components/session/session-card'), { ssr: false });

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

async function getUserSessions(username: string): Promise<Session[]> {
  const baseUrl = getServerBaseUrl();
  const url = `${baseUrl}/api/users/${username}`;
  
  const res = await fetch(url, { next: { revalidate: 60 } });
  console.log('getUserSessions response:', res);
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch sessions: ${res.status} ${res.statusText}`);
  }
  return res.json();
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

  const sessions = await getUserSessions(username);

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
        <h1 className="text-3xl font-bold">
          {userInfo.first_name} {userInfo.last_name}
        </h1>
        <p className="text-lg text-slate-400">Public Sessions</p>
      </div>
      {sessions.length === 0 ? (
        <p className="text-center text-lg">This user has no public sessions yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <DynamicSessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
