-- Enforce storage bucket visibility and row level security for community uploads.
set role supabase_storage_admin;

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
on conflict (name) do update
  set public = false,
      allowed_mime_types = '{"image/*","video/*","application/pdf","text/*"}',
      file_size_limit = 200000000,
      updated_at = now();

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
on conflict (name) do update
  set public = false,
      allowed_mime_types = '{"image/*"}',
      file_size_limit = 100000000,
      updated_at = now();

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
on conflict (name) do update
  set public = false,
      allowed_mime_types = '{"video/*"}',
      file_size_limit = 200000000,
      updated_at = now();

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
on conflict (name) do update
  set public = false,
      allowed_mime_types = '{"application/pdf","text/*","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}',
      file_size_limit = 80000000,
      updated_at = now();

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
on conflict (name) do update
  set public = false,
      allowed_mime_types = '{"application/zip","application/gzip","application/octet-stream"}',
      file_size_limit = 150000000,
      updated_at = now();

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

reset role;
