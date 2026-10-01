# RyM App — Database Specification v1.3

This document describes the logical data model. Exact PostgreSQL types, indexes, constraints, triggers, and RLS policies are implementation details to finalize during migrations.

## 1. Identity

### profiles
One application profile per authenticated user.

Suggested fields:
- id (references auth user)
- username/name
- email reference/display strategy
- weight_kg
- height_cm
- role
- created_at
- updated_at

Roles:
- user
- admin

Do not create a trainer role.

## 2. Exercises

### muscle_groups
Suggested canonical muscle-group entity.

### exercises
Official exercise catalog.

Suggested fields:
- id
- name
- muscle_group_id
- gif_url
- created_at
- updated_at
- active

`gif_url` is an optional public path (e.g. `/exercise-gifs/pecho/press-banca-barra.gif`) to a demonstration GIF served as a static file from `public/exercise-gifs`. Only the reference is stored; the GIF binary itself never lives in the database. An exercise with no demonstration keeps this field `null`, and the UI must handle that case without breaking (FEATURES.md EX-07).

### exercise_proposals
User-submitted missing exercises.

Suggested fields:
- id
- submitted_by
- name
- muscle_group_id
- status
- reviewed_by
- reviewed_at
- rejection_reason (optional)
- created_at

Proposal status:
- pending
- accepted
- rejected

An accepted proposal must result in an official exercise.

### favorite_exercises
Exercises a user marked as favorite. Personal to each user.

Suggested fields:
- user_id (references profiles)
- exercise_id (references exercises)
- created_at

The pair (user_id, exercise_id) is the primary key, so an exercise can be a favorite only once per user. Rows are deleted with the user or with the exercise.

## 3. Routines

### routines
Routine template owned by a user.

Suggested fields:
- id
- user_id
- name
- description
- created_at
- updated_at

### routine_exercises
Exercises included in a routine.

Suggested fields:
- id
- routine_id
- exercise_id
- position
- mode ('reps' | 'time', default 'reps')
- rest_seconds (default 0)
- created_at

`mode` decides how every set of this exercise is completed: `reps` (a rep count, the only mode before v1.3) or `time` (a countdown in seconds). `rest_seconds` is the rest between this exercise and the next one in the routine (0 = no rest, the default and the exact behavior of routines created before v1.3); it never applies after the last exercise.

### routine_sets
Planned sets.

Suggested fields:
- id
- routine_exercise_id
- set_number
- planned_weight_kg
- planned_reps
- planned_duration_seconds

Every set is independent. `planned_duration_seconds` is only meaningful when the parent `routine_exercises.mode` is `time`; a `reps` set leaves it `null`, and a `time` set leaves `planned_reps` `null`.

## 4. Calendar

### routine_assignments
Assignment of a routine template to a calendar date.

Suggested fields:
- id
- user_id
- routine_id
- scheduled_date
- created_at

A user has at most one assignment per date (unique user_id + scheduled_date). This is the v1 calendar rule (PRODUCT.md, decision D1).

## 5. Workouts

### workout_sessions
One actual training execution.

Suggested fields:
- id
- user_id
- source_routine_id (nullable if free-form workouts are later supported)
- started_at
- completed_at
- status
- timer_enabled
- elapsed_seconds
- scheduled_date (nullable date)

Suggested status:
- active
- paused
- completed
- abandoned

`scheduled_date` is the calendar date this workout fulfills. It is set only when the workout is started from an existing assignment and stays null for free starts. It is not a foreign key: deleting or changing the assignment later must not alter the history. Existing workouts keep it null; the calendar then falls back to the session date (METRICS.md section 7).

### workout_exercises
Exercise snapshot within a workout.

Suggested fields:
- id
- workout_session_id
- exercise_id
- position
- exercise_name_snapshot (optional but recommended for historical stability)
- mode ('reps' | 'time', copied from routine_exercises.mode at start time)
- rest_seconds (copied from routine_exercises.rest_seconds at start time)

### workout_sets
Actual performance.

Suggested fields:
- id
- workout_exercise_id
- set_number
- planned_weight_kg
- planned_reps
- planned_duration_seconds
- actual_weight_kg
- actual_reps
- completed_at

The planned values are copied/snapshotted into the workout so later routine edits do not rewrite history. A `time`-mode set only ever sets `completed_at` when its countdown ends (or is otherwise marked done); it never gets `actual_weight_kg`/`actual_reps`, since there is nothing the user types in for it (FEATURES.md WK-11).

## 6. Meals

### meals
Daily meal records.

Suggested fields:
- id
- user_id
- meal_date
- meal_type
- description
- created_at
- updated_at

Meal types:
- breakfast / desayuno
- snack
- lunch / almuerzo
- afternoon_snack / merienda
- dinner / cena

There are exactly five allowed meal types per day.

## 7. Important constraints

- Profile role must be one of `user`, `admin`.
- Exercise proposal status must be one of `pending`, `accepted`, `rejected`.
- Meal type must be one of the five allowed values.
- Routine set numbers should be unique within a routine exercise.
- Workout set numbers should be unique within a workout exercise.
- User-owned entities must reference their owner.
- Foreign keys should prevent invalid orphan relationships.
- Deletion strategy must preserve completed workout history.
- A user can have at most one assignment per date.
- A favorite is unique per (user, exercise).
- `scheduled_date` is optional and never required for a workout to be valid.

## 8. Historical integrity

A completed workout must remain historically meaningful even if:
- the source routine changes;
- the exercise name changes;
- an exercise becomes inactive.

Therefore workout execution should retain the planned and actual values required to represent what happened.

## 9. Derived data (v1.1)

The following are computed from existing tables and are **not stored**:
- workout volume and set counts;
- exercise weight progression;
- sets per muscle group per week;
- calendar day status.

Stored aggregates would drift if data changes, so definitions live in METRICS.md and are evaluated on read. Muscle group is resolved through the exercise's current `muscle_group_id`.

Suggested indexes for these reads:
- workout_sessions (user_id, status, started_at)
- workout_sessions (user_id, scheduled_date)
- workout_exercises (exercise_id)

## 10. v1.1 migration impact

- Add `workout_sessions.scheduled_date` (nullable). No backfill required.
- Create `favorite_exercises` with RLS limited to the owner.
- Add the indexes above.
- Update `rym_app_schema.sql` and `src/types/database.types.ts`.

Implemented in `rym_app_migration_003_v1_1_progress.sql` (idempotent, single transaction). Existing databases run only that file; `rym_app_schema.sql` already includes the changes for new databases.

## 11. v1.2 migration impact

- Add `exercises.gif_url` (nullable text). No backfill: existing exercises keep it `null` until an admin picks a demonstration from the exercise form.
- Update `rym_app_schema.sql` and `src/types/database.types.ts`.

Implemented in `rym_app_migration_004_exercise_gif.sql` (idempotent, single transaction). Existing databases run only that file; `rym_app_schema.sql` already includes the column for new databases.

## 12. v1.3 migration impact

- Add `routine_exercises.mode` (default `'reps'`) and `routine_exercises.rest_seconds` (default `0`). No backfill needed: the defaults reproduce exactly how every routine created before v1.3 already behaved (rep-based, no rest between exercises).
- Add `routine_sets.planned_duration_seconds` (nullable). No backfill: existing sets keep it `null`.
- Mirror both `workout_exercises.mode`/`rest_seconds` and `workout_sets.planned_duration_seconds` the same way, for the same reason (snapshots follow their routine counterparts).
- Update `rym_app_schema.sql` and `src/types/database.types.ts` (new `ExerciseMode` type).

Implemented in `rym_app_migration_005_exercise_mode_rest.sql` (idempotent, single transaction). Existing databases run only that file; `rym_app_schema.sql` already includes these columns for new databases.

## 13. v1.4 migration impact

- Add table `body_weight_logs` with columns `id`, `user_id` (FK → profiles), `logged_date` (date), `weight_kg` (numeric 5,2, check > 0 and ≤ 400), `note` (nullable text), `created_at`.
- Unique constraint `(user_id, logged_date)` — one record per user per day.
- RLS with four explicit policies (select / insert / update / delete), each scoped to `auth.uid() = user_id`.
- Index on `(user_id, logged_date desc)` for chronological reads.
- No backfill: existing users start with an empty history.
- Update `rym_app_schema.sql` and `src/types/database.types.ts`.

Implemented in `rym_app_migration_006_body_weight_logs.sql` (idempotent, single transaction). Existing databases run only that file; `rym_app_schema.sql` already includes the table for new databases.
