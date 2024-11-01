import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import { camelizeKeys } from 'humps';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const supabase = await createSupabaseClient();
  const username = params.username?.toLowerCase();

  if (!username) {
    return new NextResponse(
      JSON.stringify({ error: 'Username is required' }),
      { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('Fetching user data:', { username });

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, avatar')
      .ilike('username', username)
      .single();

    if (error) {
      console.error('Database error:', error);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database error', 
          details: error.message 
        }),
        { 
          status: error.code === 'PGRST116' ? 404 : 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!user) {
      console.log('User not found:', { username });
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('User found:', { userId: user.id, username: user.username });
    return new NextResponse(
      JSON.stringify(camelizeKeys(user)),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
