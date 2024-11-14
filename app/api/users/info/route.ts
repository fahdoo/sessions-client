import { NextRequest, NextResponse } from 'next/server';
import { createAuthSupabaseClient } from '@/lib/supabase/supabase-auth';
import { getAuth } from '@clerk/nextjs/server';
import type { UserInfo } from '@/lib/types';
import { USER_INFO_LIMITS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createAuthSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('info')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Sort by createdAt and limit to most recent items
    const sortedInfo = (data?.info || [])
      .sort((a: UserInfo, b: UserInfo) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, USER_INFO_LIMITS.MAX_ITEMS);

    return NextResponse.json({ info: sortedInfo });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user info' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { info } = await request.json();

    // Validate input
    if (!Array.isArray(info)) {
      return NextResponse.json(
        { error: 'Invalid input format' },
        { status: 400 }
      );
    }

    if (info.length > USER_INFO_LIMITS.MAX_ITEMS) {
      return NextResponse.json(
        { error: `Maximum ${USER_INFO_LIMITS.MAX_ITEMS} items allowed` },
        { status: 400 }
      );
    }

    // Format and validate each item
    const formattedInfo: UserInfo[] = info
      .filter(text => 
        typeof text === 'string' && 
        text.trim().length >= USER_INFO_LIMITS.MIN_TEXT_LENGTH
      )
      .map(text => ({
        text: text.slice(0, USER_INFO_LIMITS.MAX_TEXT_LENGTH).trim(),
        createdAt: new Date().toISOString(),
        updatedAt: null
      }));

    const supabase = await createAuthSupabaseClient();
    const { error } = await supabase
      .from('users')
      .update({ info: formattedInfo })
      .eq('id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true, info: formattedInfo });
  } catch (error) {
    console.error('Error updating user info:', error);
    return NextResponse.json(
      { error: 'Failed to update user info' },
      { status: 500 }
    );
  }
} 