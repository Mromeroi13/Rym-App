-- =========================================================
-- RyM App — Migración 003 (v1.1: progreso y calendario inteligente)
-- Fase 8, primer paso: base de datos.
--
-- Ejecutar completa en el SQL Editor de Supabase, DESPUÉS de las
-- migraciones 001 (esquema inicial) y 002 (hardening).
--
-- Es idempotente: puede ejecutarse más de una vez sin error.
-- Se ejecuta en una sola transacción: si algo falla, no se aplica nada.
--
-- Cambios (docs/DATABASE.md sección 10):
--   1. workout_sessions.scheduled_date (nullable, sin backfill)
--   2. Tabla favorite_exercises con RLS limitada al propietario
--   3. Índices para las lecturas de métricas
--
-- No se crean vistas, funciones ni agregados almacenados: las métricas
-- se calculan al leer (docs/METRICS.md, docs/ARCHITECTURE.md sección 6).
-- =========================================================

begin;

-- =========================================================
-- 1. workout_sessions.scheduled_date
-- =========================================================
-- Fecha de calendario que cumple el entrenamiento.
--  * Solo se rellena al iniciar desde una asignación existente.
--  * Queda null en inicios libres y en los entrenamientos ya existentes;
--    el calendario usa entonces la fecha local de started_at (METRICS.md §7).
--  * NO es clave foránea: borrar o cambiar la asignación después no debe
--    alterar el histórico (DATABASE.md §5).
alter table workout_sessions
  add column if not exists scheduled_date date;

comment on column workout_sessions.scheduled_date is
  'Fecha de calendario que cumple este entrenamiento. Null si se inició sin asignación. Sin FK: el histórico no depende de routine_assignments.';

-- =========================================================
-- 2. favorite_exercises
-- =========================================================
-- Favoritos personales por usuario. La pareja (user_id, exercise_id) es la
-- clave primaria: un ejercicio solo puede ser favorito una vez por usuario.
-- Se borran junto con el usuario o con el ejercicio.
create table if not exists favorite_exercises (
  user_id     uuid not null references profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

-- La PK cubre búsquedas por user_id; este índice cubre el borrado en cascada
-- y las consultas por ejercicio.
create index if not exists favorite_exercises_exercise_idx
  on favorite_exercises (exercise_id);

-- =========================================================
-- 3. RLS de favorite_exercises
-- =========================================================
-- Mismo patrón que routines / workout_sessions / meals: solo el propietario,
-- y solo mientras su cuenta esté activa. Los admins NO tienen acceso a los
-- favoritos de otros usuarios (AUTH.md).
alter table favorite_exercises enable row level security;

drop policy if exists favorite_exercises_all on favorite_exercises;

create policy favorite_exercises_all on favorite_exercises
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- =========================================================
-- 4. Índices para métricas (DATABASE.md §9)
-- =========================================================
-- Entrenamientos completados de un usuario en un rango de started_at
-- (Home, Calendario, Progreso semanal).
create index if not exists workout_sessions_user_status_started_idx
  on workout_sessions (user_id, status, started_at);

-- Entrenamientos que cumplen una fecha concreta del calendario.
create index if not exists workout_sessions_user_scheduled_date_idx
  on workout_sessions (user_id, scheduled_date);

-- Progresión de un ejercicio y "ejercicios con más peso".
create index if not exists workout_exercises_exercise_idx
  on workout_exercises (exercise_id);

commit;

-- =========================================================
-- Verificación rápida (opcional, ejecutar aparte)
-- =========================================================
-- select column_name, data_type, is_nullable
--   from information_schema.columns
--  where table_name = 'workout_sessions' and column_name = 'scheduled_date';
--
-- select policyname, cmd from pg_policies
--  where tablename = 'favorite_exercises';
--
-- select indexname from pg_indexes
--  where indexname in (
--    'workout_sessions_user_status_started_idx',
--    'workout_sessions_user_scheduled_date_idx',
--    'workout_exercises_exercise_idx',
--    'favorite_exercises_exercise_idx');
