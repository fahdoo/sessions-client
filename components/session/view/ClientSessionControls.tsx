'use client';

import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { BackButton } from '@/components/ui/back-button';
import { Session } from '@/lib/types';

interface ClientSessionControlsProps {
  session: Session;
  isOwner: boolean;
  currentTitle: string;
  transcriptStatus: string | null;
  transcriptUrl: string | null;
  signedAudioUrl?: string;
  onTitleGenerated?: (newTitle: string) => void;
  onSessionUpdate?: (updatedSession: Session) => void;
}

export function ClientSessionControls({ 
  session, 
  isOwner,
  signedAudioUrl,
  onSessionUpdate,
}: ClientSessionControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <BackButton />
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link href={`/sessions/${session.id}/edit`}>
              <ActionButton Icon={Edit2} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
