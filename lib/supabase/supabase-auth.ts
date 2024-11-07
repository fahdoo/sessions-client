import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function createAuthSupabaseClient() {
  const { getToken } = auth()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${await getToken({
            template: 'supabase',
          })}`
        },
      },
    },
  )
}
