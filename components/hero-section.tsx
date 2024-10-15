import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, MessageCircle, Sprout, Loader2, Podcast, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createNewSession } from '@/lib/utils';
import { useAuth, SignInButton, useUser } from "@clerk/nextjs";
import { Lora } from 'next/font/google';
import { getRandomTopic } from '@/lib/topics';

const lora = Lora({ subsets: ['latin'] });

export function HeroSection() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    const savedTitle = localStorage.getItem('pendingSessionTitle');
    if (savedTitle) {
      setSessionTitle(savedTitle);
      localStorage.removeItem('pendingSessionTitle');
    } else {
      setSessionTitle(getRandomTopic());
    }
  }, []);

  const handleStartSession = async () => {
    if (!sessionTitle.trim()) {
      console.log('No session title provided');
      return;
    }

    setIsCreating(true);
    try {
      if (!isSignedIn) {
        console.log('User not signed in, saving title to localStorage');
        localStorage.setItem('pendingSessionTitle', sessionTitle.trim());
        return;
      }

      console.log('Creating new session');
      const session = await createNewSession(sessionTitle.trim(), '');
      console.log('Session created:', session);
      router.push(`/sessions/${session.id}/record`);
    } catch (error) {
      console.error('Error creating new session:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const refreshTopic = () => {
    setSessionTitle(getRandomTopic());
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`${lora.className} text-4xl mb-8 text-center`}>
          Reflect on your life with AI-guided voice conversations
        </h1>
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow relative w-full sm:w-auto">
              <Input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full bg-white text-black text-lg py-6 px-4 pr-14"
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
            {isSignedIn ? (
              <Button 
                onClick={handleStartSession} 
                className="bg-blue-700 hover:bg-blue-800 text-white text-lg whitespace-nowrap py-6 px-8 w-full sm:w-auto"
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
                    Start Your Session
                  </>
                )}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  className="bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 px-8 whitespace-nowrap w-full sm:w-auto"
                >
                  <Podcast className="mr-2 h-5 w-5" />
                  Sign In to Start
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
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
