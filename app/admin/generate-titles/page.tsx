'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface SessionTitleUpdate {
  sessionId: string;
  oldTitle: string;
  newTitle: string;
}

export default function AdminUpdateTitles() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<SessionTitleUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processComplete, setProcessComplete] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setError(null);
    setProcessComplete(false);

    try {
      const token = await getToken();
      const response = await fetch('/api/admin/update-titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to update titles');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          const data = JSON.parse(line);
          if (data.error) {
            setError(data.error);
          } else {
            setResults(prev => [...prev, data]);
          }
        }
      }
    } catch (error) {
      console.error('Error updating titles:', error);
      setError('Failed to update titles');
    } finally {
      setIsLoading(false);
      setProcessComplete(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">
        <Link href="/admin" className="text-blue-500 hover:underline">Admin</Link>: Update User Session Titles
      </h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter Username"
            className="border p-2"
            required
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center space-x-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={isLoading}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            )}
            <span>{isLoading ? 'Updating...' : 'Update Titles'}</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      {processComplete && results.length === 0 && !error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-600">
          No titles were updated. This could mean no sessions need updating or there are no valid transcripts to process.
        </div>
      )}

      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mt-4 mb-2">
            Updated Titles ({results.length}):
          </h2>
          {results.map((result, index) => (
            <div key={index} className="mb-6 p-4 border rounded">
              <h3 className="text-lg font-semibold">
                Session: <Link href={`/sessions/${result.sessionId}`} className="text-blue-500 hover:underline">
                  {result.sessionId}
                </Link>
              </h3>
              <p className="mt-2 text-slate-500">Old Title: {result.oldTitle}</p>
              <p className="text-slate-500">New Title: {result.newTitle}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
