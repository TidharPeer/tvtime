-- Core schema for the TV Time replacement app.
-- Show/episode metadata is never stored here — only user-generated tracking
-- data, referenced by tmdb_show_id, fetched from TMDB on demand.

create table profiles (
  id uuid primary key references neon_auth."user"(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table user_shows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references neon_auth."user"(id) on delete cascade,
  tmdb_show_id integer not null,
  status text not null default 'plan_to_watch'
    check (status in ('watching', 'completed', 'plan_to_watch', 'dropped', 'on_hold')),
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tmdb_show_id)
);
create index user_shows_user_status_idx on user_shows (user_id, status);

create table user_episode_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references neon_auth."user"(id) on delete cascade,
  tmdb_show_id integer not null,
  season_number integer not null,
  episode_number integer not null,
  tmdb_episode_id integer,
  watched_at timestamptz not null default now(),
  unique (user_id, tmdb_show_id, season_number, episode_number)
);
create index user_episode_watches_user_show_idx on user_episode_watches (user_id, tmdb_show_id);

create table user_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references neon_auth."user"(id) on delete cascade,
  tmdb_show_id integer not null,
  season_number integer,
  episode_number integer,
  rating numeric(3, 1) not null check (rating between 0 and 10),
  rated_at timestamptz not null default now(),
  unique (user_id, tmdb_show_id, season_number, episode_number)
);

create table import_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references neon_auth."user"(id) on delete cascade,
  source text not null check (source in ('tvtime_gdpr_export', 'generic_csv', 'json')),
  raw_filename text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'committed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table import_job_items (
  id uuid primary key default gen_random_uuid(),
  import_job_id uuid not null references import_jobs(id) on delete cascade,
  source_show_title text not null,
  source_episode_info jsonb,
  matched_tmdb_show_id integer,
  match_confidence numeric,
  match_status text not null default 'needs_review'
    check (match_status in ('auto_matched', 'needs_review', 'user_confirmed', 'skipped'))
);
create index import_job_items_job_idx on import_job_items (import_job_id);

-- Row Level Security: every table scoped to the authenticated Neon Auth user.
alter table profiles enable row level security;
alter table user_shows enable row level security;
alter table user_episode_watches enable row level security;
alter table user_ratings enable row level security;
alter table import_jobs enable row level security;
alter table import_job_items enable row level security;

create policy profiles_self on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy user_shows_self on user_shows
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy user_episode_watches_self on user_episode_watches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy user_ratings_self on user_ratings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy import_jobs_self on import_jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy import_job_items_self on import_job_items
  for all using (
    exists (
      select 1 from import_jobs
      where import_jobs.id = import_job_items.import_job_id
        and import_jobs.user_id = auth.uid()
    )
  );
