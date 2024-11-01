'use client';

import { useUser } from "@clerk/nextjs";
import dynamic from 'next/dynamic';
import { Loading } from '@/components/ui/loading';
import UserHeader from '@/components/user/UserHeader';

const DynamicSessionFeed = dynamic(
  () => import('@/components/session/feed/SessionFeed'),
  { ssr: false }
);

export default function MySessions() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading fullScreen />;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view your sessions.</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pt-4">     
        <UserHeader 
          imageUrl={user.imageUrl} 
          firstName={user.firstName || ''} 
          lastName={user.lastName || ''} 
          username={user.username || ''}
        />
        <div className="py-6">
          <DynamicSessionFeed 
            fetchUrl="/api/sessions/mine"
            showUser={false}
            showDuration={true}
            showSummary={true}
            isOwner={true}
            showAudioPlayer={true}
          />
        </div>
      </div>
    </div>
  );
}
