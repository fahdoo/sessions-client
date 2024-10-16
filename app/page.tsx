'use client';

import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="mt-6">
        <SessionFeed 
          fetchUrl="/api/sessions/public"
          showUser={true}
          showDuration={false}
          showSummary={false}
          isOwner={false}
        />
      </div>
    </>
  );
}
