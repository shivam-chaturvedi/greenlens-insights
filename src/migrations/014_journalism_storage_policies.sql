-- Configure storage buckets and policies for journalism and community media assets.
set role supabase_storage_admin;

alter table storage.objects enable row level security;

drop policy if exists "storage select journalism" on storage.objects;
drop policy if exists "storage insert journalism" on storage.objects;
drop policy if exists "storage update journalism" on storage.objects;
drop policy if exists "storage delete journalism" on storage.objects;

create policy "storage select journalism" on storage.objects
  for select
  to authenticated
  using (
    bucket_id in (
      select id
      from storage.buckets
      where storage.buckets.name in (
        'journalism-article-images',
        'journalism-article-assets',
        'community-post-media',
        'community-post-images',
        'community-post-videos',
        'community-post-documents',
        'community-post-archives'
      )
    )
  );

create policy "storage insert journalism" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in (
      select id
      from storage.buckets
      where storage.buckets.name in (
        'journalism-article-images',
        'journalism-article-assets',
        'community-post-media',
        'community-post-images',
        'community-post-videos',
        'community-post-documents',
        'community-post-archives'
      )
    )
  );

create policy "storage update journalism" on storage.objects
  for update
  to authenticated
  using (
    bucket_id in (
      select id
      from storage.buckets
      where storage.buckets.name in (
        'journalism-article-images',
        'journalism-article-assets',
        'community-post-media',
        'community-post-images',
        'community-post-videos',
        'community-post-documents',
        'community-post-archives'
      )
    )
  )
  with check (
    bucket_id in (
      select id
      from storage.buckets
      where storage.buckets.name in (
        'journalism-article-images',
        'journalism-article-assets',
        'community-post-media',
        'community-post-images',
        'community-post-videos',
        'community-post-documents',
        'community-post-archives'
      )
    )
  );

create policy "storage delete journalism" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in (
      select id
      from storage.buckets
      where storage.buckets.name in (
        'journalism-article-images',
        'journalism-article-assets',
        'community-post-media',
        'community-post-images',
        'community-post-videos',
        'community-post-documents',
        'community-post-archives'
      )
    )
  );

reset role;
