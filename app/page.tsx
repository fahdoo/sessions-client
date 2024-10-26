'use client';

import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';
import { Loader2 } from 'lucide-react';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';

export default function Home() {
  const { isReady, isAuthLoaded, isUserLoaded } = useUserDataReady();

  if (!isAuthLoaded || !isUserLoaded || !isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <div className="mt-2 sm:mt-4 md:mt-6">
        <SessionFeed 
          fetchUrl="/api/sessions/public"
          showUser={true}
          showDuration={false}
          showSummary={true}
          isOwner={false}
          showAudioPlayer={false}
        />
      </div>
    </>
  );
}
