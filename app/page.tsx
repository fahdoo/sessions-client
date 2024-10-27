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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20">
      <div className="sticky top-16 bg-white dark:bg-slate-800 z-10 p-4 shadow-md">
        <HeroSection />
        <div className="my-4 flex overflow-x-auto pb-2">
          {topics.map((topic) => (
            <Button
              key={topic}
              variant={selectedTopic === topic ? "default" : "outline"}
              className="mr-2 whitespace-nowrap"
              onClick={() => setSelectedTopic(topic)}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        <SessionFeed 
          fetchUrl="/api/sessions/public"
          showUser={true}
          showDuration={true}
          showSummary={false}
          isOwner={false}
          showAudioPlayer={false}
          layout="grid"
          limit={6}
        />
        <h2 className="text-xl font-semibold my-6">Recommended hosts</h2>
        <RecommendedUsers />
      </div>
    </div>
  );
}
