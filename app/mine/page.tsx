'use client';

import SessionFeed from '@/components/session/session-feed';

export default function MySessions() {
  return (
    <SessionFeed 
      fetchUrl="/api/sessions/mine"
      showUser={false}
      showDuration={false}
      showSummary={false}
      isOwner={true}
    />
  );
}
