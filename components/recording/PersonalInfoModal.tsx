'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUserInfo } from '@/lib/hooks/useUserInfo';
import ErrorBoundary from '@/components/ui/error-boundary';
import { SkeletonInfo } from '@/components/ui/skeleton-info';
import type { UserInfo } from '@/lib/types';

function PersonalInfoModalContent() {
  const { info, isLoading, error, fetchInfo } = useUserInfo();

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchInfo}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <SkeletonInfo />
      ) : info.length > 0 ? (
        <div className="space-y-4">
          {info.map((item, index) => (
            <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              {item.text}
            </div>
          ))}
          <div className="text-center">
            <Link href="/my-info">
              <Button variant="link">
                Edit your personal info
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="py-8">
          <p className="text-slate-500 mb-4">
            No personal info added yet. Adding information about yourself helps Willow personalize your conversations.
          </p>
          <Link href="/my-info">
            <Button>Add Personal Info</Button>
          </Link>
        </div>
      )}
    </>
  );
}

export function PersonalInfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-sm text-slate-500 hover:text-slate-600">
          Add info about yourself
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your Personal Info</DialogTitle>
        </DialogHeader>
        <ErrorBoundary 
          fallback={
            <div className="text-center py-4">
              <p className="text-red-500">Something went wrong</p>
              <Button 
                variant="link" 
                onClick={() => window.location.reload()}
                className="mt-2"
              >
                Try again
              </Button>
            </div>
          }
        >
          <PersonalInfoModalContent />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
} 