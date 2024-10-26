import { auth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from './supabase-auth';
import { createPublicSupabaseClient } from './supabase-public';

export async function createSupabaseClient() {
  const { userId } = await auth();

  if (userId) {
    console.log('User is logged in, using authenticated client');
    // User is logged in, use the authenticated client
    return createAuthSupabaseClient();
  } else {
    console.log('User is not logged in, using public client');
    // User is not logged in, use the public client
    return createPublicSupabaseClient();
  }
}

