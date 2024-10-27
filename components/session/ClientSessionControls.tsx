'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Heart, Share2, ChevronLeft, MoreVertical } from 'lucide-react';
import Link from 'next/link';
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
  const router = useRouter();

  return (
    <div className="flex justify-between items-center">
      <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white">
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" className="text-white">
          <Heart className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white">
          <Share2 className="h-6 w-6" />
        </Button>
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <MoreVertical className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link href={`/sessions/${sessionId}/edit`}>Edit Session</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/sessions/${sessionId}/transcript`}>View Transcript</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
