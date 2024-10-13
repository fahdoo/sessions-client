'use client'; 

import Link from 'next/link';
import { UserButton, useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { NewSessionDialog } from '@/components/session/new-session-dialog';
import { Loader2, Podcast, Radar } from 'lucide-react';
import { Rubik } from 'next/font/google'

const rubik = Rubik({ subsets: ['latin'] })

export function Navigation() {
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();

  const createNewSession = async (title: string, systemPrompt: string) => {
    setIsCreatingSession(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, systemPrompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(`Failed to create new session: ${errorData.error || response.statusText}`);
      }

      const session = await response.json();
      setIsNewSessionDialogOpen(false);
      router.push(`/sessions/${session.id}/record`);
    } catch (error) {
      console.error('Error creating new session:', error);
      // Show an error message to the user
      alert(`Failed to create new session: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleNewSession = (title: string, systemPrompt: string) => {
    createNewSession(title, systemPrompt);
  };

  const isActivePath = (path: string) => {
    if (path === '/') {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Radar className="h-6 w-6 text-stone-300 mr-2" />
              <span className="text-stone-300 text-xl italic">
                Sessions
              </span>
            </Link>
            <div className="ml-4 flex items-baseline space-x-4">
              <Link 
                href="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/' 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                Feed
              </Link>
              {isSignedIn && (
                <Link 
                  href="/sessions" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname.startsWith('/sessions') 
                      ? 'bg-slate-900 text-white' 
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  My Sessions
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <Button 
                className="bg-blue-700 hover:bg-blue-800 text-white"
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
            ) : (
              <SignInButton mode="modal">
                <Button className="bg-blue-700 hover:bg-blue-800 text-white" size="sm">
                  Sign In
                </Button>
              </SignInButton>
            )}
            {isSignedIn && <UserButton />}
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
