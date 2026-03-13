drop policy if exists "storage select public_assets" on storage.objects;

create policy "storage select public_assets"
on storage.objects
for select
to public
using (
  bucket_id in (
    'journalism-article-images',
    'journalism-article-assets',
    'community-post-media',
    'community-post-images',
    'community-post-videos',
    'community-post-documents',
    'community-post-archives'
  )
);