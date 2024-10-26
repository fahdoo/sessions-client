'use client';

import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import SessionFeed from '@/components/session/session-feed';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function MySessions() {
  const { user } = useUser();

  if (!user) {
    // Handle the case where the user is not logged in
    return <div>Please log in to view your sessions.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        {user.imageUrl && (
          <Image
            src={user.imageUrl}
            alt={`${user.firstName} ${user.lastName}`}
            className="mx-auto mb-4 h-24 w-24 rounded-full"
          />
        )}
        <h1 className={`${lora.className} text-3xl font-bold`}>
          {user.firstName} {user.lastName}
        </h1>
      </div>
      <SessionFeed 
        fetchUrl="/api/sessions/mine"
        showUser={false}
        showDuration={false}
        showSummary={true}
        isOwner={true}
        showAudioPlayer={false}
      />
    </div>
  );
}
