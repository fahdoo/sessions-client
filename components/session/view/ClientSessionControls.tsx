'use client';

import { useState } from 'react';
import { Edit2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { BackButton } from '@/components/ui/back-button';
import { generateTitle } from '@/lib/title-generation';
import { getBaseUrl } from '@/lib/server-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ClientSessionControlsProps {
  sessionId: string;
  isOwner: boolean;
  currentTitle: string;
  onTitleGenerated?: (newTitle: string) => void;
}

export function ClientSessionControls({ 
  sessionId, 
  isOwner,
  currentTitle,
  onTitleGenerated 
}: ClientSessionControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTitle = async () => {
    try {
      setIsGenerating(true);
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/transcript`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      
      const { transcript } = await response.json();
      const newTitle = await generateTitle(transcript, currentTitle, sessionId);
      onTitleGenerated?.(newTitle);
    } catch (error) {
      console.error('Error generating title:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="relative">
        <BackButton />
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <ActionButton 
                      Icon={Wand2} 
                      onClick={handleGenerateTitle}
                      aria-label="Generate title"
                      className={isGenerating ? 'animate-spin' : ''}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate title using AI</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Link href={`/sessions/${sessionId}/edit`}>
              <ActionButton Icon={Edit2} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
