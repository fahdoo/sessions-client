'use client';

import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import { ActionButton } from '@/components/ui/action-button';
import { BackButton } from '@/components/ui/back-button';

interface ClientSessionControlsProps {
  sessionId: string;
  isOwner: boolean;
}

export function ClientSessionControls({ sessionId, isOwner }: ClientSessionControlsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="relative">
        <BackButton />
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <Link href={`/sessions/${sessionId}/edit`}>
            <ActionButton Icon={Edit2} />
          </Link>
        )}
      </div>
    </div>
  );
}
