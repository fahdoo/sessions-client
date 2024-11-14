-- Add the new array column
alter table public.users add column info jsonb[] default array[]::jsonb[];