import { useAuth } from "@clerk/nextjs";
import { createClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function useSupabase() {
  const { getToken, isSignedIn } = useAuth();
  const [supabase, setSupabase] = useState(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  useEffect(() => {
    async function updateSupabaseClient() {
      if (isSignedIn) {
        const token = await getToken({ template: 'supabase' });
        const authenticatedClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        );
        setSupabase(authenticatedClient);
      } else {
        // Use public client for unauthenticated users
        const publicClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        setSupabase(publicClient);
      }
    }

    updateSupabaseClient();
  }, [isSignedIn, getToken]);

  return supabase;
} 