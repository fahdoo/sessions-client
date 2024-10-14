'use client';

import { useUser } from "@clerk/nextjs";
import SessionFeed from '@/components/session/session-feed';

export default function MySessions() {
  const { user, isLoaded } = useUser();

  if (!user) {
    // Handle the case where the user is not logged in
    return <div>Please log in to view your sessions.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        {user.imageUrl && (
          <img
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="mx-auto mb-4 h-24 w-24 rounded-full"
          />
        )}
        <h1 className="text-3xl font-bold">
          {user.firstName} {user.lastName}
        </h1>
      </div>
      <SessionFeed 
        fetchUrl="/api/sessions/mine"
        showUser={false}
        showDuration={false}
        showSummary={false}
        isOwner={true}
      />
    </div>
  );
}
