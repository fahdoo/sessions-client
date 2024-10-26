import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from '@/lib/supabase-auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionId = params.id;
  const { isPublic } = await req.json();

  try {
    const supabase = await createAuthSupabaseClient();
    const { data, error } = await supabase
      .from('sessions')
      .update({ is_public: isPublic })
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select('id, is_public')
      .single();

    if (error) throw error;

    // Return only the updated fields
    return NextResponse.json({
      id: data.id,
      isPublic: data.is_public
    });
  } catch (error) {
    console.error('Error updating session visibility:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
