import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useClerk } from "@clerk/nextjs";
import { createNewSession } from '@/lib/utils';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';
import { getRandomTopic, topics } from '@/lib/topics';
import { ensureUserInSupabase } from '@/lib/userUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 text-white rounded-lg overflow-hidden p-6">
      <h1 className={`${lora.className} text-3xl mb-4 text-center font-bold`}>
        Podcast your life
      </h1>
      <p className={`${lora.className} text-lg mb-6 text-center text-slate-300`}>
        Explore your personal narrative through AI-guided conversations
      </p>
      <div className="max-w-md mx-auto">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type="text"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="w-full bg-slate-700 text-white text-lg px-4 pr-12"
              disabled={isCreating}
              placeholder="Enter a life experience"
            />
            <Button
              onClick={refreshTopic}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-slate-600 text-white p-1"
              disabled={isCreating}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            onClick={() => handleStartSession()} 
            className="bg-sky-600 hover:bg-sky-700 text-white text-lg"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Podcast className="mr-2 h-5 w-5" />
                {isSignedIn ? 'Start Your Session' : 'Sign In to Start'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
