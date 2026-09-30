-- =========================================================
-- RyM App — Migración 005: ejercicios por repeticiones o por tiempo,
-- descanso configurable entre ejercicios (v1.3)
-- Idempotente. Ejecutar una sola vez sobre una base ya en v1.2.
-- Las bases NUEVAS no necesitan este archivo: rym_app_schema.sql
-- ya incluye estas columnas.
--
-- Compatibilidad: todas las columnas nuevas tienen un valor por defecto
-- seguro (mode = 'reps', rest_seconds = 0, planned_duration_seconds = null),
-- así que las rutinas y entrenamientos existentes seguirán comportándose
-- exactamente igual que antes de aplicar esta migración.
-- =========================================================

begin;

alter table routine_exercises
  add column if not exists mode text not null default 'reps',
  add column if not exists rest_seconds integer not null default 0;

alter table routine_exercises
  drop constraint if exists routine_exercises_mode_check;
alter table routine_exercises
  add constraint routine_exercises_mode_check check (mode in ('reps', 'time'));

alter table routine_exercises
  drop constraint if exists routine_exercises_rest_seconds_check;
alter table routine_exercises
  add constraint routine_exercises_rest_seconds_check check (rest_seconds >= 0);

alter table routine_sets
  add column if not exists planned_duration_seconds integer;

alter table routine_sets
  drop constraint if exists routine_sets_planned_duration_seconds_check;
alter table routine_sets
  add constraint routine_sets_planned_duration_seconds_check
    check (planned_duration_seconds is null or planned_duration_seconds > 0);

alter table workout_exercises
  add column if not exists mode text not null default 'reps',
  add column if not exists rest_seconds integer not null default 0;

alter table workout_exercises
  drop constraint if exists workout_exercises_mode_check;
alter table workout_exercises
  add constraint workout_exercises_mode_check check (mode in ('reps', 'time'));

alter table workout_exercises
  drop constraint if exists workout_exercises_rest_seconds_check;
alter table workout_exercises
  add constraint workout_exercises_rest_seconds_check check (rest_seconds >= 0);

alter table workout_sets
  add column if not exists planned_duration_seconds integer;

alter table workout_sets
  drop constraint if exists workout_sets_planned_duration_seconds_check;
alter table workout_sets
  add constraint workout_sets_planned_duration_seconds_check
    check (planned_duration_seconds is null or planned_duration_seconds > 0);

comment on column routine_exercises.mode is
  'Cómo se completa cada serie de este ejercicio: "reps" (número de repeticiones, comportamiento previo a v1.3) o "time" (cuenta atrás en segundos).';
comment on column routine_exercises.rest_seconds is
  'Descanso en segundos entre este ejercicio y el siguiente de la rutina (0 = sin descanso, valor por defecto y comportamiento de las rutinas creadas antes de v1.3). No aplica tras el último ejercicio.';
comment on column routine_sets.planned_duration_seconds is
  'Duración planificada en segundos, solo relevante cuando routine_exercises.mode = ''time''. Null en series por repeticiones.';
comment on column workout_exercises.mode is
  'Copiado de routine_exercises.mode al iniciar el entrenamiento (foto de la rutina en ese momento).';
comment on column workout_exercises.rest_seconds is
  'Copiado de routine_exercises.rest_seconds al iniciar el entrenamiento.';
comment on column workout_sets.planned_duration_seconds is
  'Copiado de routine_sets.planned_duration_seconds al iniciar el entrenamiento. Una serie por tiempo se marca completada (completed_at) al terminar la cuenta atrás; no registra actual_reps/actual_weight_kg.';

commit;
