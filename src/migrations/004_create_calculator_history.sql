create extension if not exists "pgcrypto";

create table if not exists calculator_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(user_id) on delete cascade,
  title text,
  summary text,
  impact text,
  change_pct numeric,
  created_at timestamptz not null default now()
);
