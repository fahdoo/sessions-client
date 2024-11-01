import { auth } from '@clerk/nextjs/server';
import { Session, NextError } from '@/lib/types';
import { getBaseUrl } from '@/lib/server-utils';
import { AudioPlayer } from '@/components/session/audio/AudioPlayer';
import { ClientSessionView } from '@/components/session/view/ClientSessionView';
import { Suspense } from 'react';
import { ProcessingStatus } from '@/components/session/ProcessingStatus';
import { redirect, notFound } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';

async function getSession(id: string): Promise<Session> {
  const { getToken } = auth();
  const token = await getToken();
  const baseUrl = getBaseUrl();
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    const response = await fetch(`${baseUrl}/api/sessions/${id}`, {
      headers,
      cache: 'no-store'
    });

    if (!response.ok) {
      console.error('Session fetch error:', {
        status: response.status,
        statusText: response.statusText
      });
      
      if (response.status === 401 || response.status === 403) {
        const signInUrl = new URL('/sign-in', baseUrl);
        redirect(signInUrl.toString());
      }
      if (response.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch session: ${response.status}`);
    }

    const data = await response.json();
    if (!data) {
      throw new Error('No data received from API');
    }

    return data;
  } catch (error) {
    if ((error as NextError)?.digest?.includes('NEXT_REDIRECT')) {
      throw error; // Let Next.js handle the redirect
    }
    console.error('Error fetching session:', error);
    throw new Error('Unable to load session');
  }
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  return (
    <ErrorBoundary>
      <SessionPageContent params={params} />
    </ErrorBoundary>
  );
}

// Separate the content into a new component
async function SessionPageContent({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const session = await getSession(params.id);

  // If session is private and user is not the owner, redirect to sign in
  if (!session.isPublic && (!userId || session.userId !== userId)) {
    redirect('/sign-in');
  }

  const isOwner = userId === session.userId;
  const isProcessing = session.transcriptStatus === 'processing';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-32">
      {isProcessing && (
        <Suspense>
          <ProcessingStatus sessionId={params.id} />
        </Suspense>
      )}

      <div className="max-w-2xl mx-auto mt-4 px-4">
        <ClientSessionView session={session} isOwner={isOwner} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <AudioPlayer 
            sessionId={params.id}
            sessionTitle={session.title}
            userAvatarUrl={session.user?.avatar || undefined}
            userName={`${session.user?.firstName} ${session.user?.lastName}`.trim() || 'Anonymous User'}
          />
        </div>
      </div>
    </div>
  );
}
