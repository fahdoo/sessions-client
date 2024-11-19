import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { RemotionTest } from './remotion-test';
import { auth } from '@clerk/nextjs/server';

export default async function RemotionPage() {
  const { userId } = auth();
  const supabase = await createAuthSupabaseClient();
  
  // Add not null check for audio_url
  const { data: sessions, error } = await supabase
    .from('sessions')
    .select(`
      id,
      title,
      audio_url,
      created_at,
      duration,
      user_id,
      user:users!inner (
        id,
        first_name,
        last_name,
        avatar,
        username
      )
    `)
    .eq('user_id', userId)
    .not('audio_url', 'is', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching sessions:', error);
    return <div>Error loading sessions</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Remotion Video Generator</h1>
      <RemotionTest sessions={sessions || []} />
    </div>
  );
} 