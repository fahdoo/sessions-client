'use client';

import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';

export default function Home() {
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
