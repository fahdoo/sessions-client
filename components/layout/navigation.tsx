'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewSessionDialog } from '@/components/session/new-session-dialog';
import { Loader2, Podcast, Radar, FolderHeart, History } from 'lucide-react';
import { Lora } from 'next/font/google'
import { createNewSession } from '@/lib/utils'
import * as React from 'react';

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
    <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md">
        <div className="max-w-7xl mx-auto px-3">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0 flex items-center">
                <Radar className="h-5 w-5 text-slate-300 mr-2" />
                <span className={`${lora.className} text-slate-300 text-lg italic hidden md:inline`}>
                  Sessions
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
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
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="hidden md:inline ml-2">Creating...</span>
                      </>
                    ) : (
                      <>
                        <Podcast className="h-5 w-5" />
                        <span className="hidden md:inline ml-2">New Session</span>
                      </>
                    )}
                  </Button>
                  <UserButton 
                    afterSignOutUrl="/" 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: {
                          width: "32px",
                          height: "32px"
                        }
                      }
                    }}
                  />
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
      </nav>
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
    </div>
  );
}
