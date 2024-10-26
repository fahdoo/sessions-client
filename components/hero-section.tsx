import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignIn, useClerk } from "@clerk/nextjs";

import { createNewSession } from '@/lib/utils';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';
import { getRandomTopic, topics } from '@/lib/topics';
import { ensureUserInSupabase } from '@/lib/userUtils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopicCard } from "@/components/topic-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {  Loader2, Podcast, RefreshCw } from 'lucide-react';
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
    console.log('handleStartSession called');
    setIsCreating(true);

    const finalTitle = title.trim() || generateGenericTitle();
    console.log('Final title:', finalTitle);

    try {
      if (!isSignedIn || !user) {
        console.log('User is not signed in');
        localStorage.setItem('pendingSessionTitle', finalTitle);
        console.log('Pending title saved to localStorage');

        if (isSignInLoaded) {
          if (isTestMode) {
            console.log('Test mode: Simulating sign-in delay');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await handleTestModeSession(finalTitle);
          } else {
            console.log('Opening Clerk sign-in modal');
            openSignIn();
          }
        } else {
          console.log('Sign-in is not loaded yet');
        }
        setIsCreating(false);
        return;
      }

      if (isTestMode) {
        console.log('Test mode: Creating test session');
        await handleTestModeSession(finalTitle);
      } else {
        console.log('Ensuring user exists in Supabase');
        await ensureUserInSupabase(user.id, user.primaryEmailAddress?.emailAddress);

        console.log('Creating new session');
        const session = await createNewSession(finalTitle);
        console.log('Session created:', session);
        localStorage.removeItem('pendingSessionTitle');
        console.log('Redirecting to record page');
        router.push(`/sessions/${session.id}/record`);
      }
    } catch (error) {
      console.error('Error in handleStartSession:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsCreating(false);
    }
  };

  const handleTestModeSession = async (title: string) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('Test mode: Simulated session creation');
    localStorage.removeItem('pendingSessionTitle');
    router.push(`/sessions/test-session-id/record?title=${encodeURIComponent(title)}`);
  };

  const refreshTopic = () => {
    setSessionTitle(getRandomTopic());
  };

  const handleTopicSelect = async (title: string, description: string) => {
    const fullTitle = `${title}: ${description}`;
    setSessionTitle(fullTitle);
    await handleStartSession(fullTitle);
  };

  return (
    <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white mt-6 rounded-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <h1 className={`${lora.className} text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 md:mb-6 text-center font-bold`}>
          Podcast your life
        </h1>
        <p className={`${lora.className} text-lg sm:text-xl mb-4 sm:mb-6 md:mb-8 text-center text-stone-300 hidden sm:block`}>
          Explore your personal narrative through AI-guided conversations
        </p>
        <div className="max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
            <div className="flex-grow relative w-full sm:w-auto">
              <Input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-slate-200 text-slate-900 text-lg px-4 pr-24 h-full min-h-[40px] sm:min-h-[48px] md:min-h-[56px]"
                disabled={isCreating}
                placeholder="Enter a life experience or pick a theme from below"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={refreshTopic}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-stone-100 text-stone-600 p-1 h-8 flex items-center justify-center"
                      disabled={isCreating}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      <span className="text-xs hidden sm:inline">Suggest</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Suggest a topic</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button 
              onClick={() => {
                console.log('Start button clicked');
                handleStartSession();
              }} 
              className="bg-sky-600 hover:bg-sky-700 text-white text-base sm:text-lg whitespace-nowrap px-4 sm:px-6 md:px-8 w-full sm:w-auto h-10 sm:h-12 md:h-14"
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
        
        {/* Topics row */}
        <div className="mt-12">
          <div className="flex flex-wrap justify-center gap-4">
            {topics.map((topic) => (
              <div key={topic.id} className="w-[160px] sm:w-[200px]">
                <TopicCard
                  topic={topic}
                  onSelect={() => handleTopicSelect(topic.title, topic.description)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
