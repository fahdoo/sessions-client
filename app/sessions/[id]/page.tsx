import { auth } from '@clerk/nextjs/server';
import { Session } from '@/lib/types';
import { getBaseUrl } from '@/lib/server-utils';
import { AudioPlayer } from '@/components/session/audio/AudioPlayer';
import { ClientSessionPage } from './ClientSessionPage';

async function getSession(id: string): Promise<Session> {
  const { getToken } = auth();
  const token = await getToken();
  const baseUrl = getBaseUrl();
  
  const response = await fetch(`${baseUrl}/api/sessions/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }

  return response.json();
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const session = await getSession(params.id);

  if (!session.isPublic && session.userId !== userId) {
    throw new Error('Unauthorized');
  }

  const isOwner = userId === session.userId;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4">
        <div className="my-4">
          <ClientSessionPage session={session} isOwner={isOwner} />
        </div>
        
        <div className="my-4">
          <AudioPlayer 
            sessionId={params.id}
            sessionTitle={session.title}
            userAvatarUrl={session.user?.avatar}
            userName={`${session.user?.firstName} ${session.user?.lastName}`.trim()}
          />
        </div>

        {session.summary && (
          <div className="mt-4 text-slate-400 text-sm leading-relaxed">
            {session.summary}
          </div>
        )}
      </div>
    </div>
  );
}
