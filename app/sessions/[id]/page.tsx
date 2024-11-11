import { auth } from '@clerk/nextjs/server';
import { Session } from '@/lib/types';
import { getBaseUrl } from '@/lib/server';
import { ClientSessionView } from '@/components/session/view/ClientSessionView';
import { Suspense } from 'react';
import { ProcessingStatus } from '@/components/session/ProcessingStatus';
import { redirect, notFound } from 'next/navigation';
import ErrorBoundary from '@/components/ui/error-boundary';
import { DeleteSession } from '@/components/session/DeleteSession';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Define the NextError type
interface NextError extends Error {
  digest?: string;
}

/**
 * Fetches session data from the API
 * Handles:
 * - Authentication
 * - Public/private access
 * - Error states
 * - Redirects for unauthorized access
 */
async function getSession(id: string): Promise<Session> {
  const { getToken } = auth();
  const token = await getToken();
  const baseUrl = await getBaseUrl();
  
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    
    const response = await fetch(`${baseUrl}/api/sessions/${id}`, {
      headers,
      cache: 'no-store' // Always fetch fresh data since audio status might change
    });

    if (!response.ok) {
      console.error('Session fetch error:', {
        status: response.status,
        statusText: response.statusText
      });
      
      // Handle different error states
      if (response.status === 401 || response.status === 403) {
        redirect('/sign-in');
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

/**
 * Main session page content
 * Handles:
 * - Session data fetching
 * - Authorization checks
 * - Processing status display
 * - Client-side view rendering
 */
async function SessionPageContent({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const session = await getSession(params.id);

  // Add debug logging
  console.log('Session data:', {
    userId,
    sessionUserId: session.userId,
    isPublic: session.isPublic,
    session
  });

  // Check authorization:
  // 1. If user is owner, allow access
  // 2. If session is public, allow access
  // 3. Otherwise, redirect
  const isOwner = userId === session.userId;
  const isPublic = Boolean(session.isPublic); // Ensure boolean value

  if (!isOwner && !isPublic) {
    redirect('/sign-in');
  }

  const isProcessing = session.transcriptStatus === 'processing';

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {isProcessing && (
        <Suspense>
          <ProcessingStatus sessionId={params.id} />
        </Suspense>
      )}

      <div className="max-w-2xl mx-auto">
        <ClientSessionView 
          session={session} 
          isOwner={isOwner} 
        />
      </div>
    </div>
  );
}
