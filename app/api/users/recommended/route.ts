import { NextRequest, NextResponse } from 'next/server';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { camelizeKeys } from 'humps';

export async function GET(request: NextRequest) {
  const supabase = createPublicSupabaseClient();

  try {
    // Fetch a random selection of users
    // You might want to implement a more sophisticated recommendation algorithm in the future
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, avatar')
      .limit(6)  // Adjust this number as needed
      .order('created_at', { ascending: false });  // Get the most recent users

    if (error) throw error;

    const camelizedUsers = camelizeKeys(users);

    return NextResponse.json(camelizedUsers);
  } catch (error) {
    console.error('Error fetching recommended users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
