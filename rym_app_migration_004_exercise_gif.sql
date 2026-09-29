-- =========================================================
-- RyM App — Migración 004: GIF de demostración por ejercicio (v1.2)
-- Idempotente. Ejecutar una sola vez sobre una base ya en v1.1.
-- Las bases NUEVAS no necesitan este archivo: rym_app_schema.sql
-- ya incluye la columna.
-- =========================================================

begin;

alter table exercises
  add column if not exists gif_url text;

comment on column exercises.gif_url is
  'Ruta pública relativa (p. ej. /exercise-gifs/pecho/press-banca-barra.gif) al GIF demostrativo del ejercicio. '
  'El archivo se sirve como estático desde public/exercise-gifs; nunca se guarda el binario en la base de datos.';

commit;
