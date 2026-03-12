-- Ensure community buckets exist with the desired configuration
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
on conflict (name) do update set public = false, allowed_mime_types = '{"image/*","video/*","application/pdf","text/*"}', file_size_limit = 200000000, updated_at = now();

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
on conflict (name) do update set public = false, allowed_mime_types = '{"image/*"}', file_size_limit = 100000000, updated_at = now();

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
on conflict (name) do update set public = false, allowed_mime_types = '{"video/*"}', file_size_limit = 200000000, updated_at = now();

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
on conflict (name) do update set public = false, allowed_mime_types = '{"application/pdf","text/*","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}', file_size_limit = 80000000, updated_at = now();

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
on conflict (name) do update set public = false, allowed_mime_types = '{"application/zip","application/gzip","application/octet-stream"}', file_size_limit = 150000000, updated_at = now();

-- Recreate the per-table policies so the authenticated session can insert/update
alter table profiles enable row level security;
drop policy if exists "profiles select own" on profiles;
drop policy if exists "profiles insert own" on profiles;
drop policy if exists "profiles update own" on profiles;
drop policy if exists "profiles delete own" on profiles;
create policy "profiles select own" on profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on profiles for update using (auth.uid() = user_id);
create policy "profiles delete own" on profiles for delete using (auth.uid() = user_id);

alter table posts enable row level security;
drop policy if exists "posts select" on posts;
drop policy if exists "posts insert authenticated" on posts;
drop policy if exists "posts update authenticated" on posts;
drop policy if exists "posts delete authenticated" on posts;
create policy "posts select" on posts for select using (true);
create policy "posts insert authenticated" on posts for insert to authenticated with check (auth.uid() = user_id);
create policy "posts update authenticated" on posts for update to authenticated using (auth.uid() = user_id);
create policy "posts delete authenticated" on posts for delete to authenticated using (auth.uid() = user_id);

alter table comments enable row level security;
drop policy if exists "comments select" on comments;
drop policy if exists "comments insert authenticated" on comments;
drop policy if exists "comments update authenticated" on comments;
drop policy if exists "comments delete authenticated" on comments;
create policy "comments select" on comments for select using (true);
create policy "comments insert authenticated" on comments for insert to authenticated with check (auth.uid() = user_id);
create policy "comments update authenticated" on comments for update to authenticated using (auth.uid() = user_id);
create policy "comments delete authenticated" on comments for delete to authenticated using (auth.uid() = user_id);

alter table calculator_history enable row level security;
drop policy if exists "history select own" on calculator_history;
drop policy if exists "history insert own" on calculator_history;
drop policy if exists "history update own" on calculator_history;
create policy "history select own" on calculator_history for select to authenticated using (auth.uid() = user_id);
create policy "history insert own" on calculator_history for insert to authenticated with check (auth.uid() = user_id);
create policy "history update own" on calculator_history for update to authenticated using (auth.uid() = user_id);

alter table storage.objects enable row level security;
drop policy if exists "storage select uploads" on storage.objects;
drop policy if exists "storage insert uploads" on storage.objects;
drop policy if exists "storage update uploads" on storage.objects;
drop policy if exists "storage delete uploads" on storage.objects;
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
