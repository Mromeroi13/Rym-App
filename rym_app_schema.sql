-- =========================================================
-- RyM App — Esquema base (v1.0 + migración 003, v1.1 + migración 004, v1.2
-- + migración 005, v1.3 + migración 006, v1.4)
-- Para una base NUEVA: pegar y ejecutar completo en el SQL Editor de Supabase.
-- Para una base existente en v1.0: ejecutar rym_app_migration_003_v1_1_progress.sql,
-- después rym_app_migration_004_exercise_gif.sql,
-- después rym_app_migration_005_exercise_mode_rest.sql y
-- después rym_app_migration_006_body_weight_logs.sql
-- Para una base existente en v1.1: ejecutar rym_app_migration_004_exercise_gif.sql,
-- después rym_app_migration_005_exercise_mode_rest.sql y
-- después rym_app_migration_006_body_weight_logs.sql
-- Para una base existente en v1.2: ejecutar rym_app_migration_005_exercise_mode_rest.sql
-- y después rym_app_migration_006_body_weight_logs.sql
-- Para una base existente en v1.3: ejecutar solo rym_app_migration_006_body_weight_logs.sql
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================
create type app_role as enum ('user', 'admin');
create type proposal_status as enum ('pending', 'accepted', 'rejected');
create type meal_type as enum ('breakfast', 'snack', 'lunch', 'afternoon_snack', 'dinner');
create type workout_status as enum ('active', 'paused', 'completed', 'abandoned');

-- =========================================================
-- IDENTIDAD
-- =========================================================
create table profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text,
  weight_kg    numeric(5,2),
  height_cm    numeric(5,2),
  role         app_role not null default 'user',
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create unique index profiles_username_unique_idx
  on profiles (lower(username))
  where username is not null;

-- Email se lee de auth.users; no se duplica aquí.

-- =========================================================
-- EJERCICIOS
-- =========================================================
create table muscle_groups (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table exercises (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  muscle_group_id    uuid not null references muscle_groups(id) on delete restrict,
  active             boolean not null default true,
  source_proposal_id uuid,
  gif_url            text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on column exercises.gif_url is
  'Ruta pública relativa (p. ej. /exercise-gifs/pecho/press-banca-barra.gif) al GIF demostrativo del ejercicio. '
  'El archivo se sirve como estático desde public/exercise-gifs; nunca se guarda el binario en la base de datos.';

create table exercise_proposals (
  id                uuid primary key default gen_random_uuid(),
  submitted_by      uuid not null references profiles(id) on delete cascade,
  name              text not null,
  muscle_group_id   uuid not null references muscle_groups(id) on delete restrict,
  status            proposal_status not null default 'pending',
  reviewed_by       uuid references profiles(id) on delete set null,
  reviewed_at       timestamptz,
  rejection_reason  text,
  created_at        timestamptz not null default now()
);

alter table exercises
  add constraint exercises_source_proposal_fk
  foreign key (source_proposal_id) references exercise_proposals(id) on delete set null;

create index exercises_muscle_group_idx on exercises (muscle_group_id);
create index exercise_proposals_submitted_by_idx on exercise_proposals (submitted_by);
create index exercise_proposals_status_idx on exercise_proposals (status);

-- =========================================================
-- RUTINAS
-- =========================================================
create table routines (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  name        text not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table routine_exercises (
  id           uuid primary key default gen_random_uuid(),
  routine_id   uuid not null references routines(id) on delete cascade,
  exercise_id  uuid not null references exercises(id) on delete restrict,
  position     integer not null default 0,
  mode         text not null default 'reps' check (mode in ('reps', 'time')),
  rest_seconds integer not null default 0 check (rest_seconds >= 0),
  created_at   timestamptz not null default now()
);

comment on column routine_exercises.mode is
  'Cómo se completa cada serie de este ejercicio: "reps" (número de repeticiones, comportamiento previo a v1.3) o "time" (cuenta atrás en segundos).';
comment on column routine_exercises.rest_seconds is
  'Descanso en segundos entre este ejercicio y el siguiente de la rutina (0 = sin descanso, valor por defecto y comportamiento de las rutinas creadas antes de v1.3). No aplica tras el último ejercicio.';

create table routine_sets (
  id                        uuid primary key default gen_random_uuid(),
  routine_exercise_id       uuid not null references routine_exercises(id) on delete cascade,
  set_number                integer not null,
  planned_weight_kg         numeric(6,2),
  planned_reps              integer,
  planned_duration_seconds  integer check (planned_duration_seconds is null or planned_duration_seconds > 0),
  unique (routine_exercise_id, set_number)
);

comment on column routine_sets.planned_duration_seconds is
  'Duración planificada en segundos, solo relevante cuando routine_exercises.mode = ''time''. Null en series por repeticiones.';

create index routines_user_idx on routines (user_id);
create index routine_exercises_routine_idx on routine_exercises (routine_id);
create index routine_sets_routine_exercise_idx on routine_sets (routine_exercise_id);

-- =========================================================
-- CALENDARIO
-- =========================================================
create table routine_assignments (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references profiles(id) on delete cascade,
  routine_id     uuid not null references routines(id) on delete cascade,
  scheduled_date date not null,
  created_at     timestamptz not null default now(),
  unique (user_id, scheduled_date)  -- una sola rutina por día
);

create index routine_assignments_user_date_idx on routine_assignments (user_id, scheduled_date);

-- =========================================================
-- WORKOUTS (histórico, inmutable tras completar)
-- =========================================================
create table workout_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  source_routine_id  uuid references routines(id) on delete set null,
  status             workout_status not null default 'active',
  timer_enabled      boolean not null default false,
  elapsed_seconds    integer not null default 0,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  scheduled_date     date  -- fecha de calendario que cumple; null en inicios libres (sin FK a propósito)
);

create table workout_exercises (
  id                      uuid primary key default gen_random_uuid(),
  workout_session_id      uuid not null references workout_sessions(id) on delete cascade,
  exercise_id             uuid not null references exercises(id) on delete restrict,
  exercise_name_snapshot  text not null,
  position                integer not null default 0,
  mode                    text not null default 'reps' check (mode in ('reps', 'time')),
  rest_seconds            integer not null default 0 check (rest_seconds >= 0)
);

comment on column workout_exercises.mode is
  'Copiado de routine_exercises.mode al iniciar el entrenamiento (foto de la rutina en ese momento).';
comment on column workout_exercises.rest_seconds is
  'Copiado de routine_exercises.rest_seconds al iniciar el entrenamiento.';

create table workout_sets (
  id                        uuid primary key default gen_random_uuid(),
  workout_exercise_id       uuid not null references workout_exercises(id) on delete cascade,
  set_number                integer not null,
  planned_weight_kg         numeric(6,2),
  planned_reps              integer,
  planned_duration_seconds  integer check (planned_duration_seconds is null or planned_duration_seconds > 0),
  actual_weight_kg          numeric(6,2),
  actual_reps               integer,
  completed_at              timestamptz,
  unique (workout_exercise_id, set_number)
);

comment on column workout_sets.planned_duration_seconds is
  'Copiado de routine_sets.planned_duration_seconds al iniciar el entrenamiento. Una serie por tiempo se marca completada (completed_at) al terminar la cuenta atrás; no registra actual_reps/actual_weight_kg.';

create index workout_sessions_user_idx on workout_sessions (user_id);
create index workout_sessions_user_status_started_idx on workout_sessions (user_id, status, started_at);
create index workout_sessions_user_scheduled_date_idx on workout_sessions (user_id, scheduled_date);
create index workout_exercises_session_idx on workout_exercises (workout_session_id);
create index workout_exercises_exercise_idx on workout_exercises (exercise_id);
create index workout_sets_workout_exercise_idx on workout_sets (workout_exercise_id);

-- =========================================================
-- COMIDAS
-- =========================================================
create table meals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  meal_date   date not null,
  meal_type   meal_type not null,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, meal_date, meal_type)
);

create index meals_user_date_idx on meals (user_id, meal_date);

-- =========================================================
-- FAVORITOS (v1.1)
-- =========================================================
create table favorite_exercises (
  user_id     uuid not null references profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create index favorite_exercises_exercise_idx on favorite_exercises (exercise_id);

-- =========================================================
-- PESO CORPORAL HISTÓRICO (v1.4)
-- =========================================================
create table body_weight_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  logged_date date not null,
  weight_kg   numeric(5,2) not null check (weight_kg > 0 and weight_kg <= 400),
  note        text,
  created_at  timestamptz not null default now(),
  constraint body_weight_logs_user_date_unique unique (user_id, logged_date)
);

comment on table body_weight_logs is
  'Un registro de peso corporal por usuario y día. Usado para el gráfico histórico en Perfil y Progreso.';

create index body_weight_logs_user_date_idx on body_weight_logs (user_id, logged_date desc);

-- =========================================================
-- FUNCIONES DE APOYO PARA RLS
-- =========================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_current_user_active()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_active from profiles where id = auth.uid()), false);
$$;

-- =========================================================
-- TRIGGER: crear profile automáticamente al registrarse
-- =========================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- TRIGGER: evitar auto-escalada de privilegios en profiles
-- =========================================================
create or replace function prevent_profile_self_privilege_escalation()
returns trigger
language plpgsql
security definer
as $$
begin
  if auth.uid() = old.id and not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'No puedes cambiar tu propio rol';
    end if;
    if new.is_active is distinct from old.is_active then
      raise exception 'No puedes cambiar el estado de tu propia cuenta';
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_self_escalation
  before update on profiles
  for each row execute function prevent_profile_self_privilege_escalation();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table profiles enable row level security;
alter table muscle_groups enable row level security;
alter table exercises enable row level security;
alter table exercise_proposals enable row level security;
alter table routines enable row level security;
alter table routine_exercises enable row level security;
alter table routine_sets enable row level security;
alter table routine_assignments enable row level security;
alter table workout_sessions enable row level security;
alter table workout_exercises enable row level security;
alter table workout_sets enable row level security;
alter table meals enable row level security;
alter table favorite_exercises enable row level security;
alter table body_weight_logs enable row level security;

-- profiles: el propio usuario, o admin (para gestionar rol/estado)
create policy profiles_select on profiles
  for select using (id = auth.uid() or is_admin());

create policy profiles_update on profiles
  for update using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

-- muscle_groups: lectura para todos los autenticados, escritura solo admin
create policy muscle_groups_select on muscle_groups
  for select to authenticated using (true);

create policy muscle_groups_write on muscle_groups
  for all using (is_admin()) with check (is_admin());

-- exercises: lectura para todos, escritura solo admin
create policy exercises_select on exercises
  for select to authenticated using (true);

create policy exercises_write on exercises
  for all using (is_admin()) with check (is_admin());

-- exercise_proposals: el autor ve/crea las suyas; admin ve/revisa todas
create policy exercise_proposals_select on exercise_proposals
  for select using (submitted_by = auth.uid() or is_admin());

create policy exercise_proposals_insert on exercise_proposals
  for insert with check (submitted_by = auth.uid() and is_current_user_active());

create policy exercise_proposals_update on exercise_proposals
  for update using (is_admin()) with check (is_admin());

-- routines: propietario únicamente, y solo si su cuenta está activa
create policy routines_all on routines
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- routine_exercises: vía propietario de la rutina padre
create policy routine_exercises_all on routine_exercises
  for all
  using (exists (
    select 1 from routines r
    where r.id = routine_exercises.routine_id
      and r.user_id = auth.uid() and is_current_user_active()
  ))
  with check (exists (
    select 1 from routines r
    where r.id = routine_exercises.routine_id
      and r.user_id = auth.uid() and is_current_user_active()
  ));

-- routine_sets: vía propietario de la rutina abuela
create policy routine_sets_all on routine_sets
  for all
  using (exists (
    select 1 from routine_exercises re
    join routines r on r.id = re.routine_id
    where re.id = routine_sets.routine_exercise_id
      and r.user_id = auth.uid() and is_current_user_active()
  ))
  with check (exists (
    select 1 from routine_exercises re
    join routines r on r.id = re.routine_id
    where re.id = routine_sets.routine_exercise_id
      and r.user_id = auth.uid() and is_current_user_active()
  ));

-- routine_assignments: propietario únicamente
create policy routine_assignments_all on routine_assignments
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- workout_sessions: propietario únicamente
create policy workout_sessions_all on workout_sessions
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- workout_exercises: vía propietario de la sesión padre
create policy workout_exercises_all on workout_exercises
  for all
  using (exists (
    select 1 from workout_sessions ws
    where ws.id = workout_exercises.workout_session_id
      and ws.user_id = auth.uid() and is_current_user_active()
  ))
  with check (exists (
    select 1 from workout_sessions ws
    where ws.id = workout_exercises.workout_session_id
      and ws.user_id = auth.uid() and is_current_user_active()
  ));

-- workout_sets: vía propietario de la sesión abuela
create policy workout_sets_all on workout_sets
  for all
  using (exists (
    select 1 from workout_exercises we
    join workout_sessions ws on ws.id = we.workout_session_id
    where we.id = workout_sets.workout_exercise_id
      and ws.user_id = auth.uid() and is_current_user_active()
  ))
  with check (exists (
    select 1 from workout_exercises we
    join workout_sessions ws on ws.id = we.workout_session_id
    where we.id = workout_sets.workout_exercise_id
      and ws.user_id = auth.uid() and is_current_user_active()
  ));

-- meals: propietario únicamente
create policy meals_all on meals
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- favorite_exercises: propietario únicamente (los admins no acceden a favoritos ajenos)
create policy favorite_exercises_all on favorite_exercises
  for all
  using (user_id = auth.uid() and is_current_user_active())
  with check (user_id = auth.uid() and is_current_user_active());

-- body_weight_logs: propietario únicamente
create policy body_weight_logs_select on body_weight_logs
  for select using (user_id = auth.uid());

create policy body_weight_logs_insert on body_weight_logs
  for insert with check (user_id = auth.uid());

create policy body_weight_logs_update on body_weight_logs
  for update using (user_id = auth.uid());

create policy body_weight_logs_delete on body_weight_logs
  for delete using (user_id = auth.uid());

-- =========================================================
-- SEED: muscle_groups
-- =========================================================
insert into muscle_groups (name) values
  ('Pecho'),
  ('Espalda'),
  ('Piernas'),
  ('Hombros'),
  ('Brazos'),
  ('Core'),
  ('Glúteos'),
  ('Cardio')
on conflict (name) do nothing;