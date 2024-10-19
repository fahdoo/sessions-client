import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { camelizeKeys } from 'humps';

export async function GET(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = params;
  const supabase = createSupabaseClient();

  try {
    // First, get the user ID for the given username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Now fetch all sessions for this user, including those without learnings
    const { data, error } = await supabase
      .from('sessions')
      .select('id, title, created_at, learnings')
      .eq('user_id', userData.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Camelize the response data
    const camelizedData = camelizeKeys(data);

    return NextResponse.json({ sessions: camelizedData });
  } catch (error) {
    console.error('Error fetching learnings:', error);
    return NextResponse.json({ error: 'Failed to fetch learnings' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = params;
  const supabase = createSupabaseClient();

  try {
    const { sessionId, learnings } = await req.json();

    // First, get the user ID for the given username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Now update the session, ensuring it belongs to the correct user
    const { data, error } = await supabase
      .from('sessions')
      .update({ learnings })
      .eq('id', sessionId)
      .eq('user_id', userData.id)
      .select('learnings');

    if (error) throw error;

    // Camelize the response data
    const camelizedData = camelizeKeys(data[0]);

    return NextResponse.json({ updatedLearnings: camelizedData.learnings });
  } catch (error) {
    console.error('Error updating learnings:', error);
    return NextResponse.json({ error: 'Failed to update learnings' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { username: string } }
) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { username } = params;
  const supabase = createSupabaseClient();

  try {
    const { sessionId, index } = await req.json();

    // First, get the user ID for the given username
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch current learnings
    const { data: currentData, error: fetchError } = await supabase
      .from('sessions')
      .select('learnings')
      .eq('id', sessionId)
      .eq('user_id', userData.id)
      .single();

    if (fetchError) throw fetchError;

    const currentLearnings = currentData.learnings || [];
    const updatedLearnings = currentLearnings.filter((_: any, i: number) => i !== index);

    const { data, error } = await supabase
      .from('sessions')
      .update({ learnings: updatedLearnings })
      .eq('id', sessionId)
      .eq('user_id', userData.id)
      .select('learnings');

    if (error) throw error;

    // Camelize the response data
    const camelizedData = camelizeKeys(data[0]);

    return NextResponse.json({ updatedLearnings: camelizedData.learnings });
  } catch (error) {
    console.error('Error deleting learning:', error);
    return NextResponse.json({ error: 'Failed to delete learning' }, { status: 500 });
  }
}
