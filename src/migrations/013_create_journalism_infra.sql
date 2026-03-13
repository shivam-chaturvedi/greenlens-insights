-- Buckets for journalism assets (hero images, charts, and archive uploads)
insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'journalism-article-images',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"image/*"}',
  150000000,
  now(),
  now()
)
on conflict (name) do nothing;

insert into storage.buckets (id, name, owner, public, allowed_mime_types, file_size_limit, created_at, updated_at)
values (
  gen_random_uuid(),
  'journalism-article-assets',
  '00000000-0000-0000-0000-000000000000',
  false,
  '{"image/*","video/*","application/pdf","text/*"}',
  250000000,
  now(),
  now()
)
on conflict (name) do nothing;

create table if not exists articles (
  id bigserial primary key,
  slug text unique not null,
  title text not null,
  summary text,
  content text not null,
  category text not null,
  status text not null default 'draft',
  tags text[] not null default '{}'::text[],
  author_name text not null,
  author_id uuid references profiles(user_id) on delete set null,
  read_time text,
  featured_image_path text,
  featured_image_bucket text not null default 'journalism-article-images',
  published_at timestamptz,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists article_images (
  id bigserial primary key,
  article_id bigint references articles(id) on delete cascade,
  bucket_name text not null default 'journalism-article-images',
  path text not null,
  alt_text text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists article_comments (
  id bigserial primary key,
  article_id bigint references articles(id) on delete cascade,
  user_id uuid references profiles(user_id) on delete set null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists article_likes (
  id bigserial primary key,
  article_id bigint references articles(id) on delete cascade,
  user_id uuid references profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (article_id, user_id)
);
