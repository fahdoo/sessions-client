'use client';

import { Heart, Share2, FileText, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/ui/back-button';
import { ActionButton } from '@/components/ui/action-button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ClientSessionControlsProps {
  sessionId: string;
  isOwner: boolean;
}

export function ClientSessionControls({ sessionId, isOwner }: ClientSessionControlsProps) {
  return (
    <div className="w-full flex justify-between items-center">
      <div>
        <BackButton />
      </div>
      <div className="flex items-center space-x-2">
        {isOwner && (
          <>
            <Link href={`/sessions/${sessionId}/edit`}>
              <ActionButton Icon={Edit2} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
