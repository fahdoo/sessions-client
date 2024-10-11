import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface TranscriptDisplayProps {
  sessionId: string;
}

export function TranscriptDisplay({ sessionId }: TranscriptDisplayProps) {
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shouldPoll, setShouldPoll] = useState(true);

  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}/transcript`);
        if (response.status === 202) {
          // Transcript not ready yet, continue polling
          return;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch transcript');
        }
        const data = await response.json();
        if (!data.transcriptUrl) {
          throw new Error('No transcript URL available');
        }
        const transcriptResponse = await fetch(data.transcriptUrl);
        if (!transcriptResponse.ok) {
          throw new Error('Failed to fetch transcript content');
        }
        const transcriptText = await transcriptResponse.text();
        setTranscript(transcriptText);
        setIsLoading(false);
        setShouldPoll(false); // Stop polling once we've successfully fetched the transcript
      } catch (err) {
        console.error('Error fetching transcript:', err);
        setError('Failed to load transcript');
        setIsLoading(false);
        setShouldPoll(false); // Stop polling if there's an error
      }
    };

    if (shouldPoll) {
      fetchTranscript();
      const intervalId = setInterval(fetchTranscript, 5000); // Poll every 5 seconds
      return () => clearInterval(intervalId);
    }
  }, [sessionId, shouldPoll]);

  if (isLoading) {
    return (
      <div className="mt-6 bg-slate-800 shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
          <p className="text-slate-200">Loading transcript...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-slate-800 shadow-sm rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-slate-200">Transcript</h3>
        <div className="mt-2 max-h-96 overflow-y-auto">
          {transcript ? (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{transcript}</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            <p className="text-sm text-slate-500 italic">No transcript available</p>
          )}
        </div>
      </div>
    </div>
  );
}
