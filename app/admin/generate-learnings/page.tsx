'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';

interface SessionLearnings {
  sessionId: string;
  sessionTitle: string;
  learnings: string[];
}

export default function AdminGenerateLearnings() {
  const [username, setUsername] = useState('');
  const [results, setResults] = useState<SessionLearnings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/admin/generate-learnings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate learnings');
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
      console.error('Error generating learnings:', error);
      setError('Failed to generate learnings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Admin: Generate User Learnings</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
          className="border p-2 mr-2"
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`bg-blue-500 text-white px-4 py-2 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Learnings'}
        </button>
      </form>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mt-4 mb-2">Generated Learnings:</h2>
          {results.map((result, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold">
                Session: <Link href={`/sessions/${result.sessionId}`} className="text-blue-500 hover:underline">
                  {result.sessionTitle}
                </Link>
              </h3>
              <ul className="list-disc pl-5">
                {result.learnings.map((learning, learningIndex) => (
                  <li key={learningIndex}>{learning}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
