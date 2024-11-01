import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { camelizeKeys } from 'humps';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = await createSupabaseClient();
  const { username } = params;

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, avatar')
      .eq('username', username)
      .single();

    if (error) throw error;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(camelizeKeys(user));
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
