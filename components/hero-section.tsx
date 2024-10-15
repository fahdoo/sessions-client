import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lightbulb, MessageCircle, Sprout, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createNewSession } from '@/lib/utils';
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export function HeroSection() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleStartSession = async () => {
    if (!sessionTitle.trim()) return;

    setIsCreating(true);
    try {
      if (!isSignedIn) {
        return; // The button will be a SignInButton if not signed in
      }

      const session = await createNewSession(sessionTitle.trim(), ''); // Empty string for default system prompt
      router.push(`/sessions/${session.id}/record`);
    } catch (error) {
      console.error('Error creating new session:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-12 -mt-4 w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className={`${lora.className} text-4xl mb-8 text-center`}>
          Reflect, connect, and grow with AI-guided dialogues
        </h1>
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              placeholder="Enter a topic you'd like to discuss about your life, memories, or thoughts"
              value={sessionTitle}
              onChange={(e) => setSessionTitle(e.target.value)}
              className="flex-grow bg-white text-black text-lg py-6 px-4"
            />
            {isSignedIn ? (
              <Button 
                onClick={handleStartSession} 
                className="bg-blue-700 hover:bg-blue-800 text-white text-lg py-6 px-8"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Start Your Session'
                )}
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button className="bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 px-8">
                  Sign In to Start
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <Lightbulb className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
                <p>Unique perspectives on your experiences.</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <MessageCircle className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Engaging Conversations</h3>
                <p>Natural dialogues that flow effortlessly.</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-5 p-4 rounded-lg flex items-center">
              <Sprout className="h-10 w-10 mr-4 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Personal Growth</h3>
                <p>Gain insights through reflective discussions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
