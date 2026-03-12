alter table profiles enable row level security;
create policy "profiles select own" on profiles for select using (auth.uid() = user_id);
create policy "profiles insert own" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles update own" on profiles for update using (auth.uid() = user_id);
create policy "profiles delete own" on profiles for delete using (auth.uid() = user_id);

alter table posts enable row level security;
create policy "posts select" on posts for select using (true);
create policy "posts insert authenticated" on posts for insert with check (auth.uid() = user_id);
create policy "posts update authenticated" on posts for update using (auth.uid() = user_id);
create policy "posts delete authenticated" on posts for delete using (auth.uid() = user_id);

alter table comments enable row level security;
create policy "comments select" on comments for select using (true);
create policy "comments insert authenticated" on comments for insert with check (auth.uid() = user_id);
create policy "comments update authenticated" on comments for update using (auth.uid() = user_id);
create policy "comments delete authenticated" on comments for delete using (auth.uid() = user_id);

alter table calculator_history enable row level security;
create policy "history select own" on calculator_history for select using (auth.uid() = user_id);
create policy "history insert own" on calculator_history for insert with check (auth.uid() = user_id);
create policy "history update own" on calculator_history for update using (auth.uid() = user_id);

alter table storage.objects enable row level security;
create policy "storage select uploads" on storage.objects
  for select
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage insert uploads" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage update uploads" on storage.objects
  for update
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  )
  with check (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
create policy "storage delete uploads" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name like 'community-post-%')
    and auth.uid() is not null
  );
