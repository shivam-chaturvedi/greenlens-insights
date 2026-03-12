-- Combined setup for migrations 001 through 008, kept for reference and bootstrapping.

-- 001_create_profiles.sql
create extension if not exists "pgcrypto";

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  organization text,
  bio text,
  role text not null default 'community_user',
  created_at timestamptz not null default now()
);

-- 002_create_posts.sql
create table if not exists posts (
  id bigserial primary key,
  user_id uuid references profiles(user_id) on delete set null,
  title text not null,
  content text not null,
  category text not null,
  upload_type text,
  has_direct_data boolean not null default false,
  tags text[],
  likes int not null default 0,
  created_at timestamptz not null default now()
);

-- 003_create_comments.sql
create table if not exists comments (
  id bigserial primary key,
  post_id bigint references posts(id) on delete cascade,
  user_id uuid references profiles(user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 004_create_calculator_history.sql
create extension if not exists "pgcrypto";

create table if not exists calculator_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(user_id) on delete cascade,
  title text,
  summary text,
  impact text,
  change_pct numeric,
  created_at timestamptz not null default now()
);

-- 005_create_storage_buckets.sql
-- The community board keeps a dedicated bucket for mixed media plus type-specific buckets
insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-media',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"image/*","video/*","application/pdf","text/*"}',
  200000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-images',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"image/*"}',
  100000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-videos',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"video/*"}',
  200000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-documents',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"application/pdf","text/*","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}',
  80000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-archives',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"application/zip","application/gzip","application/octet-stream"}',
  150000000,
  now(),
  now()
)
on conflict (name) do nothing;

-- 006_apply_policies.sql
alter table profiles enable row level security;
create policy "profiles select own" on profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on profiles for update using (auth.uid() = user_id);
create policy "profiles delete own" on profiles for delete using (auth.uid() = user_id);

alter table posts enable row level security;
create policy "posts select" on posts for select using (true);
create policy "posts insert authenticated" on posts for insert with check (auth.uid() = user_id);
create policy "posts update authenticated" on posts for update using (auth.uid() = user_id);
create policy "posts delete authenticated" on posts for delete using (auth.uid() = user_id);

alter table comments enable row level security;
create policy "comments select" on comments for select using (true);
create policy "comments insert authenticated" on comments for insert with check (auth.uid() = user_id);
create policy "comments update authenticated" on comments for update using (auth.uid() = user_id);
create policy "comments delete authenticated" on comments for delete using (auth.uid() = user_id);

alter table calculator_history enable row level security;
create policy "history select own" on calculator_history for select using (auth.uid() = user_id);
create policy "history insert own" on calculator_history for insert with check (auth.uid() = user_id);
create policy "history update own" on calculator_history for update using (auth.uid() = user_id);

alter table storage.objects enable row level security;
create policy "storage select uploads" on storage.objects
  for select
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage insert uploads" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage update uploads" on storage.objects
  for update
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  )
  with check (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage delete uploads" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );

-- 007_extend_calculator_history.sql
alter table calculator_history
  add column if not exists total_emissions numeric,
  add column if not exists breakdown jsonb,
  add column if not exists raw_data jsonb;

-- 008_create_community_post_buckets.sql
insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-images',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"image/*"}',
  100000000,
  now(),
  now()
)
on conflict (name) do nothing;

-- 010_add_post_attachments.sql
alter table posts add column if not exists attachments jsonb not null default '[]'::jsonb;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-videos',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"video/*"}',
  200000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-documents',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"application/pdf","text/*","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}',
  80000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'community-post-archives',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"application/zip","application/gzip","application/octet-stream"}',
  150000000,
  now(),
  now()
)
on conflict (name) do nothing;
