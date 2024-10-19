# Supabase tables already created

create table
  public.users (
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone null,
    id text not null,
    email text not null,
    first_name text not null,
    last_name text not null,
    username text not null,
    avatar text null,
    memories jsonb null,
    constraint users_pkey primary key (id),
    constraint users_email_key unique (email),
    constraint users_username_key unique (username),
    constraint users_avatar_check check (
      (
        avatar ~* '^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$'::text
      )
    ),
    constraint users_username_check check (
      (
        (username ~ '^[a-zA-Z0-9_-]{3,30}$'::text)
        and (username <> 'admin'::text)
        and (username <> 'moderator'::text)
        and (username !~~* 'admin%'::text)
        and (username !~~* 'mod%'::text)
        and (
          length(
            trim(
              both
              from
                username
            )
          ) = length(username)
        )
      )
    ),
    constraint users_last_name_check check ((length(last_name) < 50)),
    constraint users_email_check check ((length(email) < 255)),
    constraint users_first_name_check check ((length(first_name) < 50))
  ) tablespace pg_default;

create table
  public.sessions (
    created_at timestamp with time zone not null default now(),
    title text null,
    user_id text not null default requesting_user_id (),
    summary text null,
    original_transcript_url text null,
    transcript_url text null,
    original_audio_url text null,
    audio_url text null,
    updated_at timestamp with time zone null,
    id uuid not null default gen_random_uuid (),
    duration integer null,
    view_count integer not null default 0,
    transcript_status text null,
    audio_status text null,
    is_public boolean not null default false,
    system_prompt text null,
    memories jsonb null,
    constraint sessions_pkey primary key (id),
    constraint sessions_id_key unique (id),
    constraint sessions_user_id_fkey foreign key (user_id) references users (id)
  ) tablespace pg_default;

# SupabaseBuckets already created
- sessions_audio
- sessions_transcripts
