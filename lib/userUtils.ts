import { createPublicSupabaseClient } from '@/lib/supabase-public';

export const ensureUserInSupabase = async (userId: string, email?: string) => {
  const maxRetries = 5;
  const retryDelay = 1000; // 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      const supabase = createPublicSupabaseClient();
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (data) {
        console.log('User found in Supabase');
        return;
      }

      if (i === maxRetries - 1) {
        throw new Error('User not found in Supabase after maximum retries');
      }

      console.log(`User not found in Supabase, retrying in ${retryDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } catch (error) {
      console.error('Error checking user in Supabase:', error);
      if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
};
