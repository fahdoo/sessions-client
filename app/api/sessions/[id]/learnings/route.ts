import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const supabase = await createSupabaseClient();

  try {
    const { learnings } = await req.json();

    const { data, error } = await supabase
      .from('sessions')
      .update({ learnings })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select();

    if (error) throw error;

    return NextResponse.json({ updatedLearnings: data[0].learnings });
  } catch (error) {
    console.error('Error updating learnings:', error);
    return NextResponse.json({ error: 'Failed to update learnings' }, { status: 500 });
  }
}
