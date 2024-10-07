import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client';
import { camelizeKeys } from 'humps';
import { Session } from '@/lib/types';

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createClerkSupabaseClientSsr();

  try {
    const { title } = await request.json();

    const { data: rawSessionData, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        title,
      })
      .select()
      .single();

    if (error) throw error;

    const sessionData = camelizeKeys(rawSessionData) as Session;

    return NextResponse.json(sessionData);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}