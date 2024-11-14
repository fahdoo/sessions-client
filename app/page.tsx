'use client';

import { useAuth } from '@clerk/nextjs';
import { QuickRecordingSession } from '@/components/recording/QuickRecordingSession';
import { HeroSection } from '@/components/HeroSection';

export default function HomePage() {
  const { isSignedIn } = useAuth();

  return (
    <div className="container mx-auto">
      {!isSignedIn && <HeroSection className="md:mt-12" />}
      <QuickRecordingSession />
    </div>
  );
}
