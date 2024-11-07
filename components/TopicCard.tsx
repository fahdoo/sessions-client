import React from 'react';
import { TopicTheme } from '@/lib/topics';
import { Noto_Serif } from 'next/font/google';
import Link from 'next/link';
import { slugify } from '@/lib/utils/format';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

interface TopicCardProps {
  theme: TopicTheme;
}

export function TopicCard({ theme }: TopicCardProps) {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 space-y-4">
      <h2 className={`${notoSerif.className} text-2xl text-slate-200 mb-4`}>
        {theme.title}
      </h2>
      <p className="text-slate-400 text-sm mb-6">
        {theme.description}
      </p>
      <div className="space-y-2">
        {theme.topics.map((topic) => (
          <Link
            key={topic}
            href={`/topics/${slugify(topic)}`}
            className="block text-slate-300 hover:text-blue-400 transition-colors py-2 px-4 rounded-lg hover:bg-slate-700/50"
          >
            {topic}
          </Link>
        ))}
      </div>
    </div>
  );
}
