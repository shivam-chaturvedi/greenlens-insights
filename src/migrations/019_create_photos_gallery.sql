-- Migration 019: Photos Gallery Table, Storage Bucket, and RLS Policies
create extension if not exists "pgcrypto";

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  caption text,
  storage_bucket text not null default 'photos-gallery',
  storage_path text not null,
  display_order int not null default 0,
  uploaded_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function photos_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists photos_set_updated_at on photos;
create trigger photos_set_updated_at
  before update on photos
  for each row
  execute function photos_set_updated_at();

alter table photos enable row level security;

-- Permissive policies for photos table
drop policy if exists "photos_public_select" on photos;
drop policy if exists "photos_admin_insert" on photos;
drop policy if exists "photos_admin_update" on photos;
drop policy if exists "photos_admin_delete" on photos;
drop policy if exists "photos_allow_all_select" on photos;
drop policy if exists "photos_allow_all_insert" on photos;
drop policy if exists "photos_allow_all_update" on photos;
drop policy if exists "photos_allow_all_delete" on photos;

create policy "photos_allow_all_select" on photos
  for select using (true);

create policy "photos_allow_all_insert" on photos
  for insert with check (true);

create policy "photos_allow_all_update" on photos
  for update using (true) with check (true);

create policy "photos_allow_all_delete" on photos
  for delete using (true);

-- Create storage bucket for photos gallery
insert into storage.buckets (
  id,
  name,
  owner,
  public,
  allowed_mime_types,
  file_size_limit,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  'photos-gallery',
  '00000000-0000-0000-0000-000000000000',
  true,
  '{"image/*"}',
  10485760,
  now(),
  now()
)
on conflict (name) do nothing;

-- Storage object access policies for photos-gallery and related buckets
drop policy if exists "photos_storage_select" on storage.objects;
drop policy if exists "photos_storage_insert" on storage.objects;
drop policy if exists "photos_storage_update" on storage.objects;
drop policy if exists "photos_storage_delete" on storage.objects;
drop policy if exists "photos_storage_allow_all_select" on storage.objects;
drop policy if exists "photos_storage_allow_all_insert" on storage.objects;
drop policy if exists "photos_storage_allow_all_update" on storage.objects;
drop policy if exists "photos_storage_allow_all_delete" on storage.objects;

create policy "photos_storage_allow_all_select" on storage.objects
  for select using (true);

create policy "photos_storage_allow_all_insert" on storage.objects
  for insert with check (true);

create policy "photos_storage_allow_all_update" on storage.objects
  for update using (true) with check (true);

create policy "photos_storage_allow_all_delete" on storage.objects
  for delete using (true);
