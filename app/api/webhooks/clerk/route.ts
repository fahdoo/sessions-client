import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClerkSupabaseClientSsr } from '@/lib/ssr/client'

export async function POST(req: Request) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!CLERK_WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your secret.
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occurred', {
      status: 400,
    })
  }

  // Handle the webhook event
  const eventType = evt.type;
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id: user_id, email_addresses, username, first_name, last_name, image_url: avatar } = evt.data;
    const email = email_addresses?.[0]?.email_address ?? null;

    if (eventType === 'user.created') {
      await handleUserCreated(user_id, email, username, first_name, last_name, avatar);
    } else if (eventType === 'user.updated') {
      await handleUserUpdated(user_id, email, username, first_name, last_name, avatar);
    }
  } else {
    // Handle other event types
    console.log('Unhandled event type:', eventType);
  }

  return new Response('', { status: 200 })
}

const supabase = createClerkSupabaseClientSsr()

async function handleUserCreated(user_id: string, email: string | null, username: string | null, first_name: string | null, last_name: string | null, avatar: string | null) {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: user_id,
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      avatar: avatar
    })

  if (error) {
    console.error('Error inserting user into Supabase:', error)
  } else {
    console.log('User created in Supabase:', username)
  }
}

async function handleUserUpdated(user_id: string, email: string | null, username: string | null, first_name: string | null, last_name: string | null, avatar: string | null) {
  const { data, error } = await supabase
    .from('users')
    .update({
      email: email,
      username: username,
      first_name: first_name,
      last_name: last_name,
      avatar: avatar
    })
    .eq('id', user_id)

  if (error) {
    console.error('Error updating user in Supabase:', error)
  } else {
    console.log('User updated in Supabase:', username)
  }
}