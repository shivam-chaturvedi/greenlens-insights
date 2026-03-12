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
