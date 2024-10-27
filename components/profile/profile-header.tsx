'use client';

import { ChevronLeft } from 'lucide-react';
import { Lora } from 'next/font/google';
import { BackButton } from '@/components/ui/back-button';

const lora = Lora({ subsets: ['latin'] });

export default function ProfileHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10 p-4 flex items-center">
      <BackButton />
      <h1 className={`${lora.className} text-xl font-bold ml-4`}>Profile</h1>
    </div>
  );
}
