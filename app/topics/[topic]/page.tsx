'use client';

import React from 'react';
import { QuickRecordingSession } from '@/components/recording/QuickRecordingSession';
import { useRouter } from 'next/navigation';
import { unslugify, isValidSlug } from '@/lib/utils/format';

export default function TopicPage({ params }: { params: { topic: string } }) {
  const router = useRouter();
  const topic = params.topic;

  if (!isValidSlug(topic)) {
    router.replace('/topics');
    return null;
  }

  const unsluggedTopic = unslugify(topic);
  return <QuickRecordingSession initialTopic={unsluggedTopic} />;
} 