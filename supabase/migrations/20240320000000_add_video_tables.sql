-- Create video format enum
create type public.video_format as enum ('default', 'instagram', 'youtube', 'tiktok');

-- Create videos table
create table public.videos (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id),
  render_id text not null,
  format video_format not null default 'default',
  status text not null default 'pending',
  video_url text,
  width integer,
  height integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add indexes for better query performance
create index videos_render_id_idx on public.videos(render_id);
create index videos_session_id_idx on public.videos(session_id);
create index videos_format_idx on public.videos(format);

-- Add RLS policies for videos table
alter table public.videos enable row level security;

-- Allow users to view their own videos and public session videos
create policy "Users can view their own videos and public session videos"
  on videos for select
  using (
    requesting_user_id() = (select user_id from sessions where id = session_id)
    or
    (select is_public from sessions where id = session_id) = true
  );

-- Allow users to create videos for their own sessions
create policy "Users can create videos for their own sessions"
  on videos for insert
  with check (
    requesting_user_id() = (select user_id from sessions where id = session_id)
  );

-- Allow users to update their own videos
create policy "Users can update their own videos"
  on videos for update
  using (
    requesting_user_id() = (select user_id from sessions where id = session_id)
  );

-- Allow users to delete their own videos
create policy "Users can delete their own videos"
  on videos for delete
  using (
    requesting_user_id() = (select user_id from sessions where id = session_id)
  );

-- Add function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Add trigger for updated_at
create trigger videos_updated_at
  before update on videos
  for each row
  execute procedure public.handle_updated_at(); 