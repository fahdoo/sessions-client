import { NextResponse, NextRequest } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client'

export async function POST(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const supabase = createClerkSupabaseClientSsr()

  try {
    const { title } = await request.json();

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        title,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}