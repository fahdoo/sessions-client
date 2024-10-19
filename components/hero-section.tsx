import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, MessageCircle, Sprout, Loader2, Podcast, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createNewSession } from '@/lib/utils';
import { useAuth, useSignIn, useUser } from "@clerk/nextjs";
import { Lora } from 'next/font/google';
import { getRandomTopic } from '@/lib/topics';

const lora = Lora({ subsets: ['latin'] });

export function HeroSection() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';

  useEffect(() => {
    const savedTitle = localStorage.getItem('pendingSessionTitle');
    if (savedTitle) {
      setSessionTitle(savedTitle);
    } else {
      setSessionTitle(getRandomTopic());
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && user && localStorage.getItem('pendingSessionTitle')) {
      handleStartSession(localStorage.getItem('pendingSessionTitle') || '');
    }
  }, [isSignedIn, user]);

  const handleStartSession = async (title: string = sessionTitle) => {
    if (!title.trim()) {
      console.log('No session title provided');
      return;
    }

    setIsCreating(true);
    setIsRedirecting(true);

    try {
      if (!isSignedIn) {
        localStorage.setItem('pendingSessionTitle', title.trim());
        if (isSignInLoaded) {
          if (isTestMode) {
            // Simulate sign-in delay in test mode
            await new Promise(resolve => setTimeout(resolve, 2000));
            // After "sign-in", proceed with session creation
            await handleTestModeSession(title);
          } else {
            await signIn.create({
              strategy: "oauth_google",
              redirectUrl: window.location.href,
            });
          }
        }
        return;
      }

      if (isTestMode) {
        await handleTestModeSession(title);
      } else {
        console.log('Creating new session');
        const session = await createNewSession(title.trim(), '');
        console.log('Session created:', session);
        localStorage.removeItem('pendingSessionTitle');
        router.push(`/sessions/${session.id}/record`);
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
      setIsRedirecting(false);
    }
  };

  const handleTestModeSession = async (title: string) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Test mode: Simulated session creation');
    localStorage.removeItem('pendingSessionTitle');
    router.push(`/sessions/test-session-id/record?title=${encodeURIComponent(title.trim())}`);
  };

  const refreshTopic = () => {
    setSessionTitle(getRandomTopic());
  };

  if (isRedirecting) {
    return (
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white py-12 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center" style={{minHeight: '50vh'}}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Preparing your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white py-6 sm:py-8 md:py-8 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`${lora.className} text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 text-center font-bold`}>
          Podcast your life
        </h1>
        <p className={`${lora.className} text-lg sm:text-xl mb-4 sm:mb-6 md:mb-8 text-center text-gray-300 hidden sm:block`}>
          Reflect on your experiences through AI-guided conversations
        </p>
        <div className="max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="flex-grow relative w-full sm:w-auto">
              <Input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-slate-200 text-slate-900 text-sm py-3 sm:py-4 md:py-6 px-4 pr-14"
                disabled={isCreating}
              />
              <Button
                onClick={refreshTopic}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 text-gray-600 p-2"
                disabled={isCreating}
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              onClick={() => handleStartSession()} 
              className="bg-blue-700 hover:bg-blue-800 text-white text-base sm:text-lg whitespace-nowrap py-3 sm:py-4 md:py-6 px-4 sm:px-6 md:px-8 w-full sm:w-auto"
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
        <div className="max-w-4xl mx-auto hidden md:block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <MessageCircle className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Engaging Conversations</h3>
                <p>Natural dialogues that flow effortlessly</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <Sprout className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Personal Growth</h3>
                <p>Gain insights through reflective discussions</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <Lightbulb className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">New dimensions</h3>
                <p>Unique perspectives on your experiences</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
