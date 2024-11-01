import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';
import { createClientAuthSupabaseClient } from '@/lib/supabase-auth-client';
import { createPublicSupabaseClient } from '@/lib/supabase-public';
import { SupabaseClient } from '@supabase/supabase-js';

export function useSupabase() {
  const { getToken, isSignedIn } = useAuth();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    async function initializeClient() {
      if (isSignedIn) {
        try {
          const token = await getToken({ template: 'supabase' });
          if (token) {
            supabaseRef.current = await createClientAuthSupabaseClient(token);
          } else {
            console.warn('No token available, falling back to public client');
            supabaseRef.current = createPublicSupabaseClient();
          }
        } catch (error) {
          console.error('Error creating authenticated Supabase client:', error);
          supabaseRef.current = createPublicSupabaseClient();
        }
      } else {
        supabaseRef.current = createPublicSupabaseClient();
      }
    }

    initializeClient();

    return () => {
      supabaseRef.current = null;
    };
  }, [isSignedIn, getToken]);

  if (!supabaseRef.current) {
    return createPublicSupabaseClient();
  }

  return supabaseRef.current;
} 