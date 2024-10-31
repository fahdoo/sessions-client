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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-32">
      <div className="max-w-2xl mx-auto px-4">
        <ClientSessionPage session={session} isOwner={isOwner} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <AudioPlayer 
              sessionId={params.id}
              sessionTitle={session.title}
              userName={`${session.user?.firstName} ${session.user?.lastName}`.trim()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
