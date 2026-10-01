-- =========================================================
-- RyM App — Migración 006: historial de peso corporal (v1.4)
-- Idempotente. Ejecutar una sola vez sobre una base ya en v1.3.
-- Las bases NUEVAS no necesitan este archivo: rym_app_schema.sql
-- ya incluirá esta tabla tras actualizar el schema.
-- =========================================================

begin;

-- Tabla de registros de peso corporal
create table if not exists body_weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  logged_date date not null,
  weight_kg   numeric(5,2) not null check (weight_kg > 0 and weight_kg <= 400),
  note        text,
  created_at  timestamptz not null default now(),
  -- Un solo registro por usuario y día
  constraint body_weight_logs_user_date_unique unique (user_id, logged_date)
);

-- RLS: cada usuario solo ve y modifica sus propios registros
alter table body_weight_logs enable row level security;

drop policy if exists "Users can view own body weight logs"   on body_weight_logs;
drop policy if exists "Users can insert own body weight logs" on body_weight_logs;
drop policy if exists "Users can update own body weight logs" on body_weight_logs;
drop policy if exists "Users can delete own body weight logs" on body_weight_logs;

create policy "Users can view own body weight logs"
  on body_weight_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own body weight logs"
  on body_weight_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own body weight logs"
  on body_weight_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own body weight logs"
  on body_weight_logs for delete
  using (auth.uid() = user_id);

-- Índice para leer el historial cronológicamente
create index if not exists body_weight_logs_user_date_idx
  on body_weight_logs (user_id, logged_date desc);

commit;
