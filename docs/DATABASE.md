# RyM App — Database Specification v1.0

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
- created_at
- updated_at
- active

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
- created_at

### routine_sets
Planned sets.

Suggested fields:
- id
- routine_exercise_id
- set_number
- planned_weight_kg
- planned_reps

Every set is independent.

## 4. Calendar

### routine_assignments
Assignment of a routine template to a calendar date.

Suggested fields:
- id
- user_id
- routine_id
- scheduled_date
- created_at

Multiple routines per date should be supported at the data-model level unless a later product decision explicitly prohibits it.

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

Suggested status:
- active
- paused
- completed
- abandoned

### workout_exercises
Exercise snapshot within a workout.

Suggested fields:
- id
- workout_session_id
- exercise_id
- position
- exercise_name_snapshot (optional but recommended for historical stability)

### workout_sets
Actual performance.

Suggested fields:
- id
- workout_exercise_id
- set_number
- planned_weight_kg
- planned_reps
- actual_weight_kg
- actual_reps
- completed_at

The planned values are copied/snapshotted into the workout so later routine edits do not rewrite history.

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

## 8. Historical integrity

A completed workout must remain historically meaningful even if:
- the source routine changes;
- the exercise name changes;
- an exercise becomes inactive.

Therefore workout execution should retain the planned and actual values required to represent what happened.
