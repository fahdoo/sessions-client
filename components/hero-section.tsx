import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, MessageCircle, Sprout, Loader2, Podcast, RefreshCw } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createNewSession } from '@/lib/utils';
import { useAuth, useSignIn, useUser } from "@clerk/nextjs";
import { Lora } from 'next/font/google';
import { getRandomTopic } from '@/lib/topics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
              
              // Check if there's a redirect URL in the result and redirect to it
              if (signInResult.status === 'needs_identifier' && signInResult.firstFactorVerification?.strategy === 'oauth_google') {
                const redirectUrl = signInResult.firstFactorVerification.externalVerificationRedirectURL;
                if (redirectUrl) {
                  console.log('Redirecting to:', redirectUrl);
                  window.location.href = redirectUrl.toString(); // Convert URL to string
                  return; // Exit the function here to prevent further execution
                }
              }
            } catch (signInError) {
              console.error('Error creating sign-in:', signInError);
            }
          }
        } else {
          console.log('Sign-in is not loaded yet');
        }
        setIsCreating(false); // Reset creating state if we haven't redirected
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
    } finally {
      console.log('Setting isCreating to false');
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

  if (!isAuthLoaded) {
    return (
      <div className="bg-gradient-to-r from-slate-950 to-slate-900 text-white py-12 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex items-center justify-center" style={{minHeight: '50vh'}}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-xl">Loading...</p>
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
          <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
            <div className="flex-grow relative w-full sm:w-auto">
              <Input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-slate-200 text-slate-900 text-sm px-4 pr-24 h-full min-h-[48px] sm:min-h-[56px] md:min-h-[64px]"
                disabled={isCreating}
                placeholder="Enter a memory, thought, or experience you want to explore"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={refreshTopic}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-transparent hover:bg-gray-100 text-gray-600 p-1 h-8 flex items-center justify-center"
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
              className="bg-blue-700 hover:bg-blue-800 text-white text-base sm:text-lg whitespace-nowrap px-4 sm:px-6 md:px-8 w-full sm:w-auto h-12 sm:h-14 md:h-16"
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
