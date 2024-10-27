'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewSessionDialog } from '@/components/session/new-session-dialog';
import { Loader2, Podcast, Radar } from 'lucide-react';
import { Lora } from 'next/font/google'
import { createNewSession } from '@/lib/utils'

const lora = Lora({ subsets: ['latin'] })

export function Navigation() {
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const handleNewSession = async (title: string, systemPrompt: string) => {
    setIsCreatingSession(true);
    try {
      const session = await createNewSession(title, systemPrompt);
      setIsNewSessionDialogOpen(false);
      router.push(`/sessions/${session.id}/record`);
    } catch (error) {
      console.error('Error creating new session:', error);
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingSession(false);
    }
  };

  return (
    <nav className="bg-white dark:bg-slate-800 fixed top-0 left-0 right-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex-shrink-0 flex items-center">
            <Radar className="h-6 w-6 text-slate-300 mr-2" />
            <span className={`${lora.className} text-slate-300 text-xl italic hidden md:inline`}>
              Sessions
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Button 
                  className="bg-slate-700 hover:bg-slate-900 text-white"
                  size="sm"
                  onClick={() => setIsNewSessionDialogOpen(true)}
                  disabled={isNewSessionDialogOpen || isCreatingSession}
                >
                  {isCreatingSession ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Podcast className="mr-2 h-4 w-4" />
                      New Session
                    </>
                  )}
                </Button>
                <UserButton />
              </>
            ) : (
              <SignInButton mode="modal">
                <Button className="bg-sky-600 hover:bg-sky-700 text-white" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
      {isSignedIn && (
        <NewSessionDialog
          isOpen={isNewSessionDialogOpen}
          onClose={() => {
            if (!isCreatingSession) {
              setIsNewSessionDialogOpen(false);
            }
          }}
          onCreateSession={handleNewSession}
          isCreating={isCreatingSession}
        />
      )}
    </nav>
  );
}
