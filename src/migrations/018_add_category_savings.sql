-- Extend consulting report categories and capture per-category savings.

alter table consulting_reports
  alter column category drop default,
  alter column category set default array['HVAC']::text[];

alter table consulting_reports
  add column if not exists category_savings jsonb not null default '{}'::jsonb;

update consulting_reports
set category_savings = jsonb_build_object(
  category[array_lower(category, 1)],
  coalesce(savings, 0)
)
where array_length(category, 1) > 0
  and (category_savings = '{}'::jsonb or category_savings is null);

alter table consulting_reports
  drop constraint if exists consulting_reports_category_check;

alter table consulting_reports
  add constraint consulting_reports_category_check
    check (category <@ array['HVAC','Lighting','Electricity','Water','Appliances','Windows/Ventilation','Other']::text[]);
