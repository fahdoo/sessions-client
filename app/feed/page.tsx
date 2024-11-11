import SessionFeed from '@/components/session/feed/SessionFeed';
import { Noto_Serif } from 'next/font/google';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  style: ['normal'],
  weight: ['300', '400']
});

export default function FeedPage() {
  return (
    <div className="container mx-auto">
      <div className="max-w-2xl mx-auto py-4 mb-8 text-center">
        <h1 className={`${notoSerif.className} text-2xl font-bold mb-2 text-slate-800 dark:text-slate-200`}>
          Discover shared moments
        </h1>
        <p className={`${notoSerif.className} text-sm text-slate-600 dark:text-slate-400`}>
          Explore thoughtful conversations and personal insights shared by others in the community.
        </p>
      </div>
      <SessionFeed 
        fetchUrl="/api/sessions/public"
        showAudioPlayer={true}
        showSummary={true}
        showDuration={true}
      />
    </div>
  );
} 