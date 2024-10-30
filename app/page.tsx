'use client';

import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';
import { Loading } from '@/components/ui/loading';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';

export default function Home() {
  const { isReady, isAuthLoaded, isUserLoaded } = useUserDataReady();

  if (!isAuthLoaded || !isUserLoaded || !isReady) {
    return <Loading fullScreen />;
  }

  return (
    <div className="mx-auto">
      <div className="p-4">
        <HeroSection />
      </div>
      <div className="p-4">
        <SessionFeed 
          fetchUrl="/api/sessions/public"
          showUser={true}
          showDuration={true}
          showSummary={true}
          isOwner={false}
          showAudioPlayer={true}
          limit={6}
        />
      </div>
    </div>
  );
}
