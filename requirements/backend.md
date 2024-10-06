# Tables already created

create table
  public.users (
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone null,
    user_id text not null,
    email text not null,
    first_name text not null,
    last_name text not null,
    username text not null,
    avatar text null,
    constraint users_pkey primary key (user_id),
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

# Buckets already created
None at the moment
