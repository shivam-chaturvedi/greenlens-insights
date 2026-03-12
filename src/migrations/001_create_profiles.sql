create extension if not exists "pgcrypto";

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  organization text,
  bio text,
  role text not null default 'community_user',
  created_at timestamptz not null default now()
);
