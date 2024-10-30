'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NewSessionDialog } from '@/components/session/new-session-dialog';
import { Loader2, Podcast, Radar, FolderHeart, History, X } from 'lucide-react';
import { Noto_Serif } from 'next/font/google';
import { isSafari } from '@/lib/browser-utils';

import { createNewSession } from '@/lib/utils'
import * as React from 'react';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['300', '400']
});

export function Navigation() {
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isRadarSpinning, setIsRadarSpinning] = useState(false);
  const [showSafariWarning, setShowSafariWarning] = useState(false);

  useEffect(() => {
    setShowSafariWarning(isSafari());
  }, []);

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

  const handleRadarClick = () => {
    setIsRadarSpinning(true);
    setTimeout(() => setIsRadarSpinning(false), 500);
  };

  const handleSignOut = () => {
    localStorage.removeItem('lastSessionId');
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {showSafariWarning && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm text-center relative">
          <div className="max-w-3xl mx-auto">
            Safari doesn't support our audio format. Please use Chrome or another browser for the best experience.
            <button 
              onClick={() => setShowSafariWarning(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:opacity-70"
              aria-label="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <div className="px-4 pt-4">
        <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full shadow-md">
          <div className="max-w-7xl mx-auto px-3">
            <div className="flex items-center justify-between h-12">
              <div className="flex items-center">
                <Link 
                  href="/" 
                  className="flex-shrink-0 flex items-center hover:opacity-80 transition-opacity" 
                  onClick={handleRadarClick}
                >
                  <Radar className={`h-5 w-5 text-slate-300 mr-2 ${isRadarSpinning ? 'animate-spin' : ''}`} />
                  <span className={`${notoSerif.className} text-slate-300 text-lg italic hidden md:inline`}>
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
                    <SignOutButton>
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
                    </SignOutButton>
                  </>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" size="sm">
                      Sign In
                    </Button>
                  </SignInButton>
                )}
              </div>
            </div>
          </div>
        </nav>
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
    </div>
  );
}
