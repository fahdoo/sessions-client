'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/hero-section';
import SessionFeed from '@/components/session/session-feed';
import { Loader2 } from 'lucide-react';
import { useUserDataReady } from '@/lib/hooks/useUserDataReady';
import { Button } from '@/components/ui/button';
import RecommendedUsers from '@/components/recommended-users';

const topics = ['Business', 'Technology', 'Health', 'Entertainment', 'Sports'];

export default function Home() {
  const { isReady, isAuthLoaded, isUserLoaded } = useUserDataReady();
  const [selectedTopic, setSelectedTopic] = useState('');

  if (!isAuthLoaded || !isUserLoaded || !isReady) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="p-4">
        <HeroSection />
      </div>
      <div className="px-4 py-4 rounded-lg">
        <h2 className="font-semibold mb-4">Recent Sessions</h2>
        <SessionFeed 
          fetchUrl="/api/sessions/public"
          showUser={true}
          showDuration={true}
          showSummary={true}
          isOwner={false}
          showAudioPlayer={false}
          limit={6}
        />
      </div>
    </div>
  );
}
