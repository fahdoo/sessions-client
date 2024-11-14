'use client';

import React from 'react';
import { TopicCard } from '@/components/TopicCard';
import { topicThemes } from '@/lib/topics';
import { Noto_Serif } from 'next/font/google';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

export default function TopicsPage() {
  return (
    <div className="md:max-w-4xl mx-auto">
      <div className="text-center my-16">
        <h1 className={`${notoSerif.className} text-4xl text-slate-200 mb-6`}>
          Pick a topic to discuss
        </h1>
        <p className="text-slate-400 text-lg mb-3">
          Each topic is designed to help you share your story in a meaningful way.
        </p>
        <p className="text-slate-500">
          Select any topic that interests you to begin a new conversation.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {topicThemes.map((theme) => (
          <TopicCard key={theme.id} theme={theme} />
        ))}
      </div>
    </div>
  );
}
