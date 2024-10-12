import { auth } from '@clerk/nextjs/server';
import { createAuthSupabaseClient } from './supabase-auth';
import { createPublicSupabaseClient } from './supabase-public';

export function createSupabaseClient() {
  const { userId } = auth();

  if (userId) {
    // User is logged in, use the authenticated client
    return createAuthSupabaseClient();
  } else {
    // User is not logged in, use the public client
    return createPublicSupabaseClient();
  }
}

