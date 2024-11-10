-- Add auphonic_uuid column to sessions table
ALTER TABLE public.sessions 
ADD COLUMN auphonic_uuid text,
-- Add a unique constraint to ensure no duplicate auphonic_uuid values
ADD CONSTRAINT sessions_auphonic_uuid_key UNIQUE (auphonic_uuid);

-- Remove the status constraint since we want to be more flexible
ALTER TABLE public.sessions 
DROP CONSTRAINT IF EXISTS sessions_audio_status_check;

-- Add comment to explain the column
COMMENT ON COLUMN public.sessions.auphonic_uuid IS 'Unique identifier for Auphonic processing job';