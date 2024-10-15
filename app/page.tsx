'use client';

import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';

export default function Home() {
  return (
    <>
      <HeroSection />
      <div className="mt-8"> {/* Added margin-top to separate from HeroSection */}
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
