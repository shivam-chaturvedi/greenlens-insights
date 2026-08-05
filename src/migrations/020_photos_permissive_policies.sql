-- Migration 020: Permissive Policies for Photos Table and Storage Buckets
create extension if not exists "pgcrypto";

-- Ensure photos table exists
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

-- Ensure photos-gallery bucket exists
insert into storage.buckets (id, name, public)
values (gen_random_uuid(), 'photos-gallery', true)
on conflict (name) do nothing;

-- Enable RLS on photos table
alter table photos enable row level security;

-- Drop strict/existing policies on photos
drop policy if exists "photos_public_select" on photos;
drop policy if exists "photos_admin_insert" on photos;
drop policy if exists "photos_admin_update" on photos;
drop policy if exists "photos_admin_delete" on photos;
drop policy if exists "photos_allow_all_select" on photos;
drop policy if exists "photos_allow_all_insert" on photos;
drop policy if exists "photos_allow_all_update" on photos;
drop policy if exists "photos_allow_all_delete" on photos;

-- Permissive policies for photos table
create policy "photos_allow_all_select" on photos
  for select using (true);

create policy "photos_allow_all_insert" on photos
  for insert with check (true);

create policy "photos_allow_all_update" on photos
  for update using (true) with check (true);

create policy "photos_allow_all_delete" on photos
  for delete using (true);

-- Drop strict/existing policies on storage.objects for photos
drop policy if exists "photos_storage_select" on storage.objects;
drop policy if exists "photos_storage_insert" on storage.objects;
drop policy if exists "photos_storage_update" on storage.objects;
drop policy if exists "photos_storage_delete" on storage.objects;
drop policy if exists "photos_storage_allow_all_select" on storage.objects;
drop policy if exists "photos_storage_allow_all_insert" on storage.objects;
drop policy if exists "photos_storage_allow_all_update" on storage.objects;
drop policy if exists "photos_storage_allow_all_delete" on storage.objects;

-- Permissive policies for storage objects
create policy "photos_storage_allow_all_select" on storage.objects
  for select using (true);

create policy "photos_storage_allow_all_insert" on storage.objects
  for insert with check (true);

create policy "photos_storage_allow_all_update" on storage.objects
  for update using (true) with check (true);

create policy "photos_storage_allow_all_delete" on storage.objects
  for delete using (true);
