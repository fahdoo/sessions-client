'use client';

import { useState } from 'react';
import { GenerateTitleButton } from './generate-title-button';
import { generateTitle } from '@/lib/title-generation';
import { getBaseUrl } from '@/lib/server-utils';

interface TitleSectionProps {
  title: string;
  sessionId: string;
  isOwner: boolean;
}

export function TitleSection({ title: initialTitle, sessionId, isOwner }: TitleSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState(initialTitle);

  return (
    <div className="flex items-center gap-2">
      <h1 className="text-2xl sm:text-3xl font-bold text-white sm:text-slate-900 sm:dark:text-white text-center max-w-xl">
        {title}
      </h1>
      {isOwner && (
        <GenerateTitleButton 
          isGenerating={isGenerating}
          onClick={async () => {
            try {
              setIsGenerating(true);
              const baseUrl = getBaseUrl();
              const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/transcript`);
              if (!response.ok) {
                throw new Error('Failed to fetch transcript');
              }
              const { transcript } = await response.json();
              const newTitle = await generateTitle(transcript, title, sessionId);
              setTitle(newTitle);
            } catch (error) {
              console.error('Error generating title:', error);
            } finally {
              setIsGenerating(false);
            }
          }}
        />
      )}
    </div>
  );
} 