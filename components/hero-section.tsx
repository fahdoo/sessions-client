import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, MessageCircle, Sprout, Loader2, Podcast, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createNewSession } from '@/lib/utils';
import { useAuth, useSignIn, useUser } from "@clerk/nextjs";
import { Lora } from 'next/font/google';
import { getRandomTopic, topics } from '@/lib/topics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopicCard } from "@/components/topic-card";

const lora = Lora({ subsets: ['latin'] });

export function HeroSection() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('test') === 'true';
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);

  useEffect(() => {
    const pendingTitle = localStorage.getItem('pendingSessionTitle');
    if (pendingTitle) {
      setSessionTitle(pendingTitle);
    }
  }, []);

  useEffect(() => {
    if (isSignedIn && user && localStorage.getItem('pendingSessionTitle')) {
      handleStartSession(localStorage.getItem('pendingSessionTitle') || '');
    }
  }, [isSignedIn, user]);

  const generateGenericTitle = () => {
    return `Untitled Session - ${new Date().toLocaleString()}`;
  };

  const handleStartSession = async (title: string = sessionTitle) => {
    console.log('handleStartSession called');
    setIsCreating(true);

    const finalTitle = title.trim() || generateGenericTitle();
    console.log('Final title:', finalTitle);

    try {
      console.log('isSignedIn:', isSignedIn);
      console.log('isSignInLoaded:', isSignInLoaded);
      console.log('isTestMode:', isTestMode);

      if (!isSignedIn) {
        console.log('User is not signed in');
        localStorage.setItem('pendingSessionTitle', finalTitle);
        console.log('Pending title saved to localStorage');

        if (isSignInLoaded) {
          if (isTestMode) {
            console.log('Test mode: Simulating sign-in delay');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await handleTestModeSession(finalTitle);
          } else {
            console.log('Attempting to create sign-in');
            try {
              const signInResult = await signIn.create({
                strategy: "oauth_google",
                redirectUrl: window.location.href,
              });
              console.log('Sign-in creation successful', signInResult);
              
              if (signInResult.status === 'needs_identifier' && signInResult.firstFactorVerification?.strategy === 'oauth_google') {
                const redirectUrl = signInResult.firstFactorVerification.externalVerificationRedirectURL;
                if (redirectUrl) {
                  console.log('Redirecting to:', redirectUrl);
                  window.location.href = redirectUrl.toString();
                  return;
                }
              }
            } catch (signInError) {
              console.error('Error creating sign-in:', signInError);
              setIsCreating(false);
            }
          }
        } else {
          console.log('Sign-in is not loaded yet');
          setIsCreating(false);
        }
        return;
      }

      if (isTestMode) {
        console.log('Test mode: Creating test session');
        await handleTestModeSession(finalTitle);
      } else {
        console.log('Creating new session');
        const session = await createNewSession(finalTitle, '');
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
    // Note: We're not setting isCreating to false here, as we want to keep the button disabled until redirection
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

  const nextTopic = () => {
    setCurrentTopicIndex((prevIndex) => (prevIndex + 1) % topics.length);
  };

  const prevTopic = () => {
    setCurrentTopicIndex((prevIndex) => (prevIndex - 1 + topics.length) % topics.length);
  };

  const handleTopicSelect = async (title: string, description: string) => {
    const fullTitle = `${title}: ${description}`;
    setSessionTitle(fullTitle);
    await handleStartSession(fullTitle);
  };

  if (!isAuthLoaded) {
    return (
      <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white py-12 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center" style={{minHeight: '50vh'}}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white py-6 sm:py-8 md:py-8 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="w-full bg-slate-200 text-slate-900 text-sm px-4 pr-24 h-full min-h-[40px] sm:min-h-[48px] md:min-h-[56px]"
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
        
        {/* Topics row for all screen sizes */}
        <div className="mt-12 overflow-x-auto">
          <div className="flex space-x-4 pb-4" style={{ width: 'max-content' }}>
            {topics.map((topic) => (
              <div key={topic.id} className="w-[160px] sm:w-[200px] flex-shrink-0">
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
