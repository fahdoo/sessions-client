'use client';

import { useState } from 'react';
import { Edit2, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { BackButton } from '@/components/ui/back-button';
import { generateTitle } from '@/lib/ai/generateTitle';
import { getClientBaseUrl } from '@/lib/utils/client';
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
  transcriptStatus: string | null;
  transcriptUrl: string | null;
  onTitleGenerated?: (newTitle: string) => void;
}

export function ClientSessionControls({ 
  sessionId, 
  isOwner,
  currentTitle,
  transcriptStatus,
  transcriptUrl,
  onTitleGenerated 
}: ClientSessionControlsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if transcript is available for title generation
  const canGenerateTitle = transcriptStatus === 'completed' || transcriptStatus === 'db_synced';

  const handleGenerateTitle = async () => {
    if (!canGenerateTitle) return;

    try {
      setIsGenerating(true);
      const baseUrl = getClientBaseUrl();
      const response = await fetch(`${baseUrl}/api/sessions/${sessionId}/transcript`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }
      
      const { transcript } = await response.json();
      const newTitle = await generateTitle(transcript, currentTitle, sessionId);
      
      // Make sure we have a valid title before calling onTitleGenerated
      if (newTitle && typeof newTitle === 'string') {
        onTitleGenerated?.(newTitle);
      } else {
        console.error('Invalid title received:', newTitle);
      }
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
        {isOwner && canGenerateTitle && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <ActionButton 
                    Icon={Wand2} 
                    onClick={handleGenerateTitle}
                    aria-label="Generate title"
                    disabled={!canGenerateTitle}
                    className={isGenerating ? 'animate-spin' : ''}
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Generate title using AI</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {isOwner && (
          <Link href={`/sessions/${sessionId}/edit`}>
            <ActionButton Icon={Edit2} />
          </Link>
        )}
      </div>
    </div>
  );
}
