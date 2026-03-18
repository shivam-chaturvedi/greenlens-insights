-- Create table for published consulting reports and storage bucket for PDFs.
create extension if not exists "pgcrypto";

create table if not exists consulting_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'Other' check (category in ('Lighting','Appliances','HVAC','Windows/Ventilation','Other')),
  savings numeric not null default 0,
  pdf_bucket text not null default 'consulting-reports',
  pdf_path text not null,
  summary text,
  uploaded_by uuid references profiles(user_id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function consulting_reports_set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists consulting_reports_set_updated_at on consulting_reports;
create trigger consulting_reports_set_updated_at
  before update on consulting_reports
  for each row
  execute function consulting_reports_set_updated_at();

alter table consulting_reports enable row level security;

create policy "consulting_reports select public" on consulting_reports
  for select using (true);

create policy "consulting_reports admin insert" on consulting_reports
  for insert with check (
    exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "consulting_reports admin update" on consulting_reports
  for update
  using (
    exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  )
  with check (
    exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "consulting_reports admin delete" on consulting_reports
  for delete using (
    exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

-- Storage bucket for PDF reports.
insert into storage.buckets (
  id,
  name,
  owner,
  public,
  allowed_mime_types,
  file_size_limit,
  created_at,
  updated_at
)
values (
  gen_random_uuid(),
  'consulting-reports',
  '00000000-0000-0000-0000-000000000000',
  true,
  '{"application/pdf"}',
  200000000,
  now(),
  now()
)
on conflict (name) do nothing;

-- Storage policies targeting the consulting reports bucket.
create policy "consulting_reports storage insert" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "consulting_reports storage update" on storage.objects
  for update
  to authenticated
  with check (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );

create policy "consulting_reports storage delete" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and exists (
      select 1
      from profiles
      where user_id = auth.uid()
        and role = 'admin'
    )
  );


-- Ensure public select access to consulting reports bucket
create policy "consulting_reports storage select" on storage.objects
  for select
  using (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
  );



-- Normalize consulting report policies by recreating them with helper checks.
create or replace function is_consulting_admin(uid uuid) returns boolean stable language sql as $$
  select exists (
    select 1 from profiles where user_id = uid and role = 'admin'
  );
$$;

grant execute on function is_consulting_admin(uuid) to authenticated;
grant execute on function is_consulting_admin(uuid) to "service_role";
grant execute on function is_consulting_admin(uuid) to anon;

drop policy if exists "consulting_reports admin insert" on consulting_reports;
create policy "consulting_reports admin insert" on consulting_reports
  with check (is_consulting_admin(auth.uid()));

drop policy if exists "consulting_reports admin update" on consulting_reports;
create policy "consulting_reports admin update" on consulting_reports
  using (is_consulting_admin(auth.uid()))
  with check (is_consulting_admin(auth.uid()));

drop policy if exists "consulting_reports admin delete" on consulting_reports;
create policy "consulting_reports admin delete" on consulting_reports
  using (is_consulting_admin(auth.uid()));

drop policy if exists "consulting_reports storage insert" on storage.objects;
create policy "consulting_reports storage insert" on storage.objects
  with check (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and is_consulting_admin(auth.uid())
  );

drop policy if exists "consulting_reports storage update" on storage.objects;
create policy "consulting_reports storage update" on storage.objects
  using (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and is_consulting_admin(auth.uid())
  );

drop policy if exists "consulting_reports storage delete" on storage.objects;
create policy "consulting_reports storage delete" on storage.objects
  using (
    bucket_id in (select id from storage.buckets where name = 'consulting-reports')
    and is_consulting_admin(auth.uid())
  );


alter table consulting_reports disable row level security;

drop policy if exists "consulting_reports public select" on consulting_reports;
drop policy if exists "consulting_reports public insert" on consulting_reports;
drop policy if exists "consulting_reports public update" on consulting_reports;
drop policy if exists "consulting_reports public delete" on consulting_reports;

create policy "consulting_reports public select" on consulting_reports
  for select using (true);
create policy "consulting_reports public insert" on consulting_reports
  for insert with check (true);
create policy "consulting_reports public update" on consulting_reports
  for update using (true) with check (true);
create policy "consulting_reports public delete" on consulting_reports
  for delete using (true);

alter table consulting_reports enable row level security;


INSERT INTO storage.buckets (id, name, public)
VALUES (gen_random_uuid(), 'consulting-reports', true)
ON CONFLICT (name) DO NOTHING;

CREATE POLICY "allow all storage insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "allow all storage select"
ON storage.objects
FOR SELECT
USING (true);

CREATE POLICY "allow all storage update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow all storage delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (true);