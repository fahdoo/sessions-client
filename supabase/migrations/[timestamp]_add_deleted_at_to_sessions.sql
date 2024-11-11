alter table sessions 
add column if not exists deleted_at timestamp with time zone;

-- Add an index to improve query performance when filtering deleted sessions
create index if not exists sessions_deleted_at_idx on sessions(deleted_at); 