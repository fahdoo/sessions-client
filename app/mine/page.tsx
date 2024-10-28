'use client';

import { useUser } from "@clerk/nextjs";
import SessionFeed from '@/components/session/session-feed';
import { Loader2 } from "lucide-react";
import UserHeader from '@/components/user/UserHeader'; // Import the new UserHeader component

export default function MySessions() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view your sessions.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20">
      <div className="container mx-auto">
        <UserHeader 
          imageUrl={user.imageUrl} 
          firstName={user.firstName || ''} 
          lastName={user.lastName || ''} 
          username={user.username || ''}
        />
        <div className="p-4">
          <SessionFeed 
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
