-- ============================================================
-- Migration 007 – set_rest_seconds
-- Adds per-set rest time to routine_sets and workout_sets.
-- ============================================================

-- routine_sets: tiempo de descanso después de ESTA serie (antes de la siguiente)
alter table routine_sets
  add column if not exists set_rest_seconds integer not null default 0;

-- workout_sets: snapshot copiado desde routine_sets al iniciar el entrenamiento
alter table workout_sets
  add column if not exists set_rest_seconds integer not null default 0;
