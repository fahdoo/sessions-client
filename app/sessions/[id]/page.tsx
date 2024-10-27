import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from '@/lib/supabase-client';
import { getSignedUrl } from '@/lib/server-utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import WaveformPlayer from '@/components/session/WaveformPlayer';
import { ClientSessionControls } from '@/components/session/ClientSessionControls';
import { Globe, Lock } from 'lucide-react';

async function getSession(id: string) {
  const supabase = await createSupabaseClient();
  const { data: session, error } = await supabase
    .from('sessions')
    .select(`
      *,
      user:users (
        id,
        first_name,
        last_name,
        avatar,
        username
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!session) throw new Error('Session not found');

  return session;
}

export default async function SessionPage({ params }: { params: { id: string } }) {
  const { userId } = auth();
  const session = await getSession(params.id);

  if (!session.is_public && session.user_id !== userId) {
    throw new Error('Unauthorized');
  }

  let signedAudioUrl = null;
  if (session.audio_url) {
    signedAudioUrl = await getSignedUrl(session.audio_url);
  }

  const isOwner = userId === session.user_id;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="relative h-1/3 bg-slate-200 dark:bg-slate-800 rounded-b-3xl shadow-lg overflow-hidden">
        <Avatar className="w-full h-full rounded-none">
          <AvatarImage src={session.user.avatar} alt={`${session.user.first_name} ${session.user.last_name}`} className="object-cover" />
          <AvatarFallback className="text-6xl">{session.user.first_name[0]}{session.user.last_name[0]}</AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <ClientSessionControls sessionId={session.id} isOwner={isOwner} />
          <div className="z-10 flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 drop-shadow-md">{session.title}</h1>
              <p className="text-xs text-slate-200 drop-shadow-md">
                {session.user.first_name} {session.user.last_name} • {new Date(session.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge 
              variant="secondary" 
              className="flex items-center mb-1"
            >
              {session.is_public ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
              {session.is_public ? 'Public' : 'Private'}
            </Badge>
          </div>
        </div>
      </div>
      <div className="py-6 px-4">
        {signedAudioUrl && <WaveformPlayer audioUrl={signedAudioUrl} />}
      </div>
      <div className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-700">{session.summary}</p>
      </div>
    </div>
  );
}
