import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from '@/lib/supabase-client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ClientSessionControls } from '@/components/session/ClientSessionControls';
import { Globe, Lock, ChevronLeft } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { AudioPlayer } from '@/components/session/audio-player';
import { formatDuration } from '@/lib/utils';

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

  const isOwner = userId === session.user_id;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto px-4">
        <div className="relative bg-slate-200 dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden md:mt-8">
          <div className="absolute top-4 left-4 right-4 z-20">
            <ClientSessionControls sessionId={session.id} isOwner={isOwner} />
          </div>

          {/* Desktop: Stack vertically and center */}
          <div className="md:flex md:flex-col md:items-center md:p-6 pt-16">
            {/* Avatar container */}
            <div className="w-full md:w-40 md:h-40">
              <Avatar className="w-full h-full rounded-none md:rounded-xl">
                <AvatarImage src={session.user.avatar} alt={`${session.user.first_name} ${session.user.last_name}`} className="object-cover" />
                <AvatarFallback className="text-6xl">{session.user.first_name[0]}{session.user.last_name[0]}</AvatarFallback>
              </Avatar>
            </div>
          
            {/* Gradient overlay only shows on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent md:hidden" />
          
            {/* Content container */}
            <div className="absolute inset-0 md:static flex flex-col justify-end md:justify-start p-4 md:p-0 md:mt-6 w-full">
              <div className="z-10 flex flex-col items-center gap-4">
                <h1 className="text-2xl md:text-4xl font-bold text-white md:text-slate-900 md:dark:text-white text-center max-w-xl">
                  {session.title}
                </h1>
                <div className="flex items-center gap-2 text-xs md:text-sm text-slate-200 md:text-slate-600 md:dark:text-slate-400">
                  <span>{session.user.first_name} {session.user.last_name}</span>
                  {session.duration && (
                    <>
                      <span>•</span>
                      <span>{formatDuration(session.duration)}</span>
                    </>
                  )}
                  <span>•</span>
                  <span>{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <Badge 
                  variant="secondary" 
                  className="flex items-center flex-shrink-0"
                >
                  {session.is_public ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                  {session.is_public ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        
        <div className="my-4">
          <Card className="bg-zinc-600 rounded-xl">
            <AudioPlayer sessionId={params.id} />
          </Card>
        </div>
        <div className="my-4">
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-600">
            {session.summary}
          </p>
        </div>
      </div>
    </div>
  );
}
