'use client'; 

import Link from 'next/link';
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { NewSessionDialog } from '@/components/session/new-session-dialog';

export function Navigation() {
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const router = useRouter();

  const createNewSession = async (title: string, systemPrompt: string) => {
    setIsCreatingSession(true);
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, systemPrompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to create new session');
      }

      const session = await response.json();
      
      // Navigate to the record page for the new session
      router.push(`/sessions/${session.id}/record`);
    } catch (error) {
      console.error('Error creating new session:', error);
      // Here you might want to show an error message to the user
    } finally {
      setIsCreatingSession(false);
      setIsNewSessionDialogOpen(false);
    }
  };

  const handleNewSession = (title: string, systemPrompt: string) => {
    createNewSession(title, systemPrompt);
  };

  return (
    <nav className="bg-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="text-stone-300 font-bold text-xl italic">
                Sessions
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Feed
                </Link>
                <Link href="/sessions/" className="text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    My Sessions
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              className="bg-blue-700 hover:bg-blue-800 text-white"
              size="sm"
              onClick={() => setIsNewSessionDialogOpen(true)}
              disabled={isNewSessionDialogOpen}
            >
              New Session
            </Button>
            <UserButton />
          </div>
        </div>
      </div>
      <NewSessionDialog
        isOpen={isNewSessionDialogOpen}
        onClose={() => setIsNewSessionDialogOpen(false)}
        onCreateSession={handleNewSession}
        isCreating={isCreatingSession}
      />
    </nav>
  );
}