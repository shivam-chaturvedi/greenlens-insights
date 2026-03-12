alter table calculator_history
  add column if not exists total_emissions numeric,
  add column if not exists breakdown jsonb,
  add column if not exists raw_data jsonb;
