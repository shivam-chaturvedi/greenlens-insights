-- Allow consulting reports to belong to multiple categories.
alter table consulting_reports
  alter column category drop default;

alter table consulting_reports
  alter column category type text[] using array[category],
  alter column category set not null;

alter table consulting_reports
  alter column category set default array['Other']::text[];

alter table consulting_reports
  drop constraint if exists consulting_reports_category_check;

alter table consulting_reports
  add constraint consulting_reports_category_check
    check (category <@ array['Lighting','Appliances','HVAC','Windows/Ventilation','Other']::text[]);
