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
