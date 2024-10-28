import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useClerk } from "@clerk/nextjs";
import { createNewSession } from '@/lib/utils';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';
import { getRandomTopic, topics } from '@/lib/topics';
import { ensureUserInSupabase } from '@/lib/userUtils';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Podcast, RefreshCw } from 'lucide-react';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export function HeroSection() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isSignedIn, isAuthLoaded, isUserLoaded, user } = useUserDataReady();
  const { isLoaded: isSignInLoaded } = useSignIn();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  const { openSignIn } = useClerk();

  useEffect(() => {
    const pendingTitle = localStorage.getItem('pendingSessionTitle');
    if (pendingTitle) {
      setSessionTitle(pendingTitle);
    }
  }, []);

  useEffect(() => {
    const isDataReady = isAuthLoaded && isUserLoaded && isSignInLoaded;
    const hasPendingTitle = Boolean(localStorage.getItem('pendingSessionTitle'));

    if (isDataReady && isSignedIn && user && hasPendingTitle) {
      handleStartSession(localStorage.getItem('pendingSessionTitle') || '');
    }
  }, [isAuthLoaded, isUserLoaded, isSignInLoaded, isSignedIn, user]);

  const generateGenericTitle = () => {
    return `Untitled Session - ${new Date().toLocaleString()}`;
  };

  const handleStartSession = async (title: string = sessionTitle) => {
    setIsCreating(true);
    const finalTitle = title.trim() || generateGenericTitle();

    try {
      if (!isSignedIn || !user) {
        localStorage.setItem('pendingSessionTitle', finalTitle);
        if (isSignInLoaded) {
          if (isTestMode) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await handleTestModeSession(finalTitle);
          } else {
            openSignIn();
          }
        }
        setIsCreating(false);
        return;
      }

      if (isTestMode) {
        await handleTestModeSession(finalTitle);
      } else {
        await ensureUserInSupabase(user.id, user.primaryEmailAddress?.emailAddress);
        const session = await createNewSession(finalTitle);
        localStorage.removeItem('pendingSessionTitle');
        router.push(`/sessions/${session.id}/record`);
      }
    } catch (error) {
      console.error('Error in handleStartSession:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestModeSession = async (title: string) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    localStorage.removeItem('pendingSessionTitle');
    router.push(`/sessions/test-session-id/record?title=${encodeURIComponent(title)}`);
  };

  const refreshTopic = () => {
    setSessionTitle(getRandomTopic());
  };

  return (
    <div className="text-slate-50 rounded-lg overflow-hidden p-4">
      <h1 className={`${lora.className} text-3xl mb-6 text-center`}>
        What do you want to discuss?
      </h1>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Textarea
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full bg-slate-600 text-slate-300 text-lg px-4 pr-12 mb-2 border-0 leading-tight"
              disabled={isCreating}
              placeholder="Anything on your mind like your past, dreams, interests, etc."
              rows={4}
            />
            <Button
              onClick={refreshTopic}
              className="absolute right-2 top-2 bg-transparent hover:bg-slate-600 text-white p-1"
              disabled={isCreating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={() => handleStartSession()} 
            className="bg-blue-500 hover:bg-blue-600 text-blue-50 flex h-auto p-3 w-full sm:max-w-[225px] mx-auto"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Podcast className="mr-3 h-10 w-10 flex-shrink-0" />
                <div className="flex flex-col items-start">
                  <span className="text-lg">
                    {isSignedIn ? 'Start Your Session' : 'Sign In to Start'}
                  </span>
                  <span className="text-sm font-light opacity-80">Get ready to talk</span>
                </div>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
