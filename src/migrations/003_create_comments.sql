create table if not exists comments (
  id bigserial primary key,
  post_id bigint references posts(id) on delete cascade,
  user_id uuid references profiles(user_id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
