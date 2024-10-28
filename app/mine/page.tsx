'use client';

import { useUser } from "@clerk/nextjs";
import Image from 'next/image';
import SessionFeed from '@/components/session/session-feed';
import { Lora } from 'next/font/google';

const lora = Lora({ subsets: ['latin'] });

export default function MySessions() {
  const { user } = useUser();

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Please log in to view your sessions.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-20">
      <div className="bg-white dark:bg-slate-800 p-6 shadow-md">
        <div className="mx-auto">
          <div className="flex items-center mb-4">
            {user.imageUrl && (
              <Image
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="h-16 w-16 rounded-full mr-4"
                width={64}
                height={64}
              />
            )}
            <h1 className={`${lora.className} text-2xl font-bold`}>
              {user.firstName} {user.lastName}
            </h1>
          </div>
        </div>
      </div>
      <div className="p-4">
        <SessionFeed 
          fetchUrl="/api/sessions/mine"
          showUser={false}
          showDuration={true}
          showSummary={true}
          isOwner={true}
          showAudioPlayer={false}
          layout="list"
        />
      </div>
    </div>
  );
}
