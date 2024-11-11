import React, { useState } from 'react';
import { TopicTheme } from '@/lib/topics';
import { Noto_Serif } from 'next/font/google';
import Link from 'next/link';
import { slugify } from '@/lib/utils/format';
import { 
  Brain, // Growth & Learning
  Briefcase, // Career & Aspirations
  Palette, // Creativity & Arts
  Leaf, // Lifestyle & Wellness
  Globe2, // Society & Culture
  Sparkles, // Fun & Memories
  Telescope, // Nature & Science
  BookHeart, // Personal Reflections
} from 'lucide-react';

const notoSerif = Noto_Serif({ 
  subsets: ['latin'],
  weight: ['400', '700']
});

interface TopicCardProps {
  theme: TopicTheme;
}

const themeIcons: Record<string, React.ReactNode> = {
  'personal-reflections': <BookHeart className="h-6 w-6" />,
  'growth-learning': <Brain className="h-6 w-6" />,
  'career-aspirations': <Briefcase className="h-6 w-6" />,
  'creativity-arts': <Palette className="h-6 w-6" />,
  'lifestyle-wellness': <Leaf className="h-6 w-6" />,
  'society-culture': <Globe2 className="h-6 w-6" />,
  'fun-memories': <Sparkles className="h-6 w-6" />,
  'nature-science': <Telescope className="h-6 w-6" />,
};

export function TopicCard({ theme }: TopicCardProps) {
  const [showAllTopics, setShowAllTopics] = useState(false);
  const displayedTopics = showAllTopics ? theme.topics : theme.topics.slice(0, 5);

  return (
    <div className="bg-slate-800/50 hover:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="text-slate-400 mt-1">
          {themeIcons[theme.id]}
        </div>
        <div>
          <h2 className={`${notoSerif.className} text-2xl text-slate-200`}>
            {theme.title}
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            {theme.description}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {displayedTopics.map((topic) => (
          <Link
            key={topic}
            href={`/topics/${slugify(topic)}`}
            className="block text-slate-300 hover:text-blue-400 transition-colors py-1.5"
          >
            {topic}
          </Link>
        ))}
      </div>

      {theme.topics.length > 5 && (
        <button
          onClick={() => setShowAllTopics(!showAllTopics)}
          className="mt-4 text-sm text-slate-400 hover:text-slate-300 transition-colors"
        >
          {showAllTopics ? 'Show less' : `See ${theme.topics.length - 5} more`}
        </button>
      )}
    </div>
  );
}
