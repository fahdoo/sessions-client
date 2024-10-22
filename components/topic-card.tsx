import React from 'react';
import Image from 'next/image';
import { Topic } from '@/lib/topics';

interface TopicCardProps {
  topic: Topic;
  onSelect: () => void;
}

export function TopicCard({ topic, onSelect }: TopicCardProps) {
  return (
    <div 
      className="cursor-pointer group w-full h-full"
      onClick={onSelect}
    >
      <div className="relative aspect-[9/16] rounded-lg overflow-hidden mb-2">
        <Image
          src={topic.image}
          alt={topic.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <p className="text-white text-lg lg:text-base text-center overflow-y-auto max-h-full">{topic.description}</p>
        </div>
      </div>
      <h3 className="text-white text-base text-center truncate">{topic.title}</h3>
    </div>
  );
}
