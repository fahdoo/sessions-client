'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { User, Session } from '@/lib/types';
import { FaSpinner, FaCheck, FaExternalLinkAlt } from 'react-icons/fa';
import debounce from 'lodash/debounce';
import Link from 'next/link';
import { confirmAction } from '@/lib/utils/client';
import { formatDate } from '@/lib/utils/format';
import LoadingIndicator from '@/components/LoadingIndicator';
import { X } from 'lucide-react';

const SESSIONS_PER_PAGE = 10;

export default function UserSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savingStates, setSavingStates] = useState<Record<string, 'saving' | 'saved' | null>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const [editedLearnings, setEditedLearnings] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      fetchUserData();
      fetchSessions();
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  async function fetchUserData() {
    if (!clerkUser?.username) return;

    try {
      const response = await fetch(`/api/users/${clerkUser.username}`);
      if (!response.ok) throw new Error('Failed to fetch user data');
      const userData = await response.json();
      setUser(userData as User);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  async function fetchSessions() {
    if (!clerkUser?.username) return;

    try {
      const response = await fetch(`/api/users/${clerkUser.username}/learnings`);
      if (!response.ok) throw new Error('Failed to fetch sessions');
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }

  const debouncedUpdateLearning = useCallback(
    debounce(async (sessionId: string, index: number, newLearning: string) => {
      if (!clerkUser?.username) return;

      try {
        const updatedSession = sessions.find(s => s.id === sessionId);
        if (!updatedSession || !updatedSession.learnings) return;

        const updatedLearnings = [...updatedSession.learnings];
        updatedLearnings[index] = newLearning;

        const response = await fetch(`/api/users/${clerkUser.username}/learnings`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, learnings: updatedLearnings }),
        });

        if (!response.ok) throw new Error('Failed to update learning');

        setSessions(prevSessions => prevSessions.map(s => 
          s.id === sessionId ? { ...s, learnings: updatedLearnings } : s
        ));
        setSavingStates(prev => ({ ...prev, [`${sessionId}-${index}`]: 'saved' }));
        setTimeout(() => setSavingStates(prev => ({ ...prev, [`${sessionId}-${index}`]: null })), 2000);
      } catch (error) {
        console.error('Error updating learning:', error);
        setSavingStates(prev => ({ ...prev, [`${sessionId}-${index}`]: null }));
      }
    }, 1000),
    [clerkUser?.username, sessions]
  );

  const updateLearning = useCallback((sessionId: string, index: number, newLearning: string) => {
    const key = `${sessionId}-${index}`;
    setEditedLearnings(prev => ({ ...prev, [key]: newLearning }));
    setSavingStates(prev => ({ ...prev, [key]: 'saving' }));
    debouncedUpdateLearning(sessionId, index, newLearning);
  }, [debouncedUpdateLearning]);

  async function deleteLearning(sessionId: string, index: number) {
    if (!clerkUser?.username) return;
    
    const isConfirmed = await confirmAction("Are you sure you want to delete this learning? This action cannot be undone.");
    if (!isConfirmed) return;

    setIsLoading(true);

    try {
      const updatedSession = sessions.find(s => s.id === sessionId);
      if (!updatedSession || !updatedSession.learnings) return;

      const updatedLearnings = updatedSession.learnings.filter((_, i) => i !== index);

      const response = await fetch(`/api/users/${clerkUser.username}/learnings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, learnings: updatedLearnings }),
      });

      if (!response.ok) throw new Error('Failed to delete learning');

      setSessions(prevSessions => prevSessions.map(s => 
        s.id === sessionId ? { ...s, learnings: updatedLearnings } : s
      ));
    } catch (error) {
      console.error('Error deleting learning:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const paginatedSessions = sessions.slice((currentPage - 1) * SESSIONS_PER_PAGE, currentPage * SESSIONS_PER_PAGE);
  const totalPages = Math.ceil(sessions.length / SESSIONS_PER_PAGE);

  if (!isLoaded || !isSignedIn) {
    return <div className="text-white">Please sign in to view your learnings.</div>;
  }

  if (!user) {
    return <LoadingIndicator message="Loading learnings..." />;
  }

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Learnings about {user?.firstName} {user?.lastName}</h1>
        
        <div className="bg-blue-900 border-l-4 border-blue-500 p-4 mb-6 text-sm" role="alert">
          <p className="font-bold mb-2">Why we store learnings:</p>
          <p>We use this information to personalize your AI interview experience, enabling more relevant interactions and follow-up questions. You have full control over this data.</p>
        </div>

        <div className="space-y-6">
          {paginatedSessions.map((session) => (
            <div key={session.id} className="border-b border-gray-700 pb-6">
              <h3 className="text-xl font-bold mb-2">
                <Link href={`/sessions/${session.id}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {session.title} <FaExternalLinkAlt className="inline-block ml-2 text-sm" />
                </Link>
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                {formatDate(session.createdAt)}
              </p>
              {session.learnings && session.learnings.length > 0 ? (
                <div className="space-y-2">
                  {session.learnings.map((learning, index) => {
                    const key = `${session.id}-${index}`;
                    const editedLearning = editedLearnings[key] !== undefined ? editedLearnings[key] : learning;
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={editedLearning}
                          onChange={(e) => updateLearning(session.id, index, e.target.value)}
                          className="bg-gray-800 text-white text-sm px-2 py-1 rounded w-full"
                        />
                        {savingStates[key] === 'saving' && <FaSpinner className="animate-spin" />}
                        {savingStates[key] === 'saved' && <FaCheck className="text-green-500" />}
                        <button 
                          onClick={() => deleteLearning(session.id, index)}
                          className="text-slate-400 hover:text-red-500 transition-colors duration-200"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-300">No learnings for this session.</p>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 text-xs">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        <div className="mt-4 text-xs">
          <p>Total Sessions: {sessions.length}</p>
        </div>
      </div>
    </div>
  );
}
