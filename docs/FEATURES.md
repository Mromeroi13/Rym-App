# RyM App — Features v1.1

## Authentication

### AUTH-01 Registration
A new user can create an account.

### AUTH-02 Login
A registered user can authenticate.

### AUTH-03 Logout
An authenticated user can log out.

### AUTH-04 Password recovery
The authentication system supports password recovery/reset.

## Profile

### PROF-01 Account data
Display account email and basic identity information.

### PROF-02 Body data
Store and edit:
- weight in kg
- height in cm

### PROF-03 Profile states
Support loading, editing, saving, success, validation error, and save error states.

## Exercises

### EX-01 Official exercise
An official exercise has a name and muscle group.

### EX-02 Browse
Users can browse exercises by muscle group.

### EX-03 Proposal
A user can request an exercise that does not exist.

### EX-04 Review
An admin can accept or reject a proposal.

### EX-05 Publication
An accepted proposal becomes an official exercise.

### EX-06 Administration
An admin can create/edit/remove official exercises according to the final authorization rules.

### EX-07 Demonstration GIF
An official exercise can optionally have a demonstration GIF. An admin picks it from the exercise form, choosing only among the files that physically exist in `public/exercise-gifs`; the choice is stored as a public path in `exercises.gif_url`. An exercise with no GIF assigned is valid and must not break any screen that displays it.

## Routines

### RT-01 Create
A user can create a reusable routine template.

### RT-02 Edit
A user can edit their routine.

### RT-03 Exercises
A routine contains exercises.

### RT-04 Sets
Each routine exercise can have any number of planned sets.

### RT-05 Independent set configuration
Every set independently stores planned weight and planned repetitions.

### RT-06 Calendar assignment
A routine can be assigned to a calendar date.

### RT-07 Favorite exercises
A user can mark and unmark an official exercise as favorite. The star control is available in the exercise picker of the routine editor and in the exercise explorer.

### RT-08 Favorites in the exercise picker
When adding exercises to a routine, the picker offers a "Favoritos" filter next to the muscle-group filters. In the "Todos" view, favorites are listed first. Search and muscle-group filters combine with the favorites filter. Favorites that were deactivated in the catalog are hidden.

### RT-09 Favorites states
The picker supports an empty favorites state ("Aún no tienes favoritos") and a recoverable error if a favorite cannot be saved.

### RT-10 View exercise demonstration
While creating or editing a routine, each exercise already added offers a "ver cómo se realiza" action. It opens a modal that plays the exercise's `gif_url`. If the exercise has no GIF, the modal shows a "no hay demostración disponible" message instead of failing. Opening or closing this modal never changes the routine draft.

### RT-11 Reps or time mode
Each routine exercise has a `mode`: `reps` (default, identical to pre-v1.3 behavior) or `time`. In `reps` mode every set stores planned reps as before. In `time` mode every set stores a planned duration in seconds instead; the exercise's reps field is not used. Switching an exercise's mode in the editor does not lose the values already typed for the other mode.

### RT-12 Rest between exercises
Each routine exercise has an optional `rest_seconds` (0 by default, meaning no rest — the exact behavior of routines created before v1.3). It is the rest between that exercise and the next one in the routine; it never applies after the last exercise. Editable from the same per-exercise controls as the mode toggle.

## Workouts

### WK-01 Start
A user can start a workout from a routine.

### WK-02 Snapshot
Starting a workout creates an execution based on the planned routine values.

### WK-03 Actual values
Actual weight and repetitions are recorded independently.

### WK-04 Global timer
A workout can use one global timer.

### WK-05 Timer pause/resume
The timer can pause/resume without resetting.

### WK-06 Timer continuity
Changing exercises never resets the timer.

### WK-07 Complete
A completed workout stores its actual execution.

### WK-08 Exit protection
Exiting an active workout protects against accidental data loss.

### WK-09 Scheduled date
A workout started from a calendar assignment (from the calendar or from Home) stores the date it fulfills in `scheduled_date`. A workout started without an assignment stores no date.

### WK-10 View exercise demonstration
While a workout is in progress, the current-exercise screen offers a "ver cómo se realiza" action, reusing the same modal and the same `gif_url` as RT-10. Opening or closing it never resets or alters the workout's sets, reps, timer, or completion state; it is a read-only overlay on top of the in-progress session.

### WK-11 Time-mode exercise execution
When the selected exercise's snapshot `mode` is `time`, the set panel shows a countdown from the set's `planned_duration_seconds` down to 0 instead of reps/weight inputs. Reaching 0 plays a short sound, marks the set completed automatically, and — mirroring the reps-mode flow — selects the next pending set of that exercise. A completed time-mode set can still be marked pending again from the same undo control used for reps-mode sets. Pausing the workout's global timer also freezes the exercise countdown; resuming continues it from where it was frozen, not from the start.

### WK-12 Rest between exercises
When every set of the current exercise becomes completed (manually or automatically) and its snapshot `rest_seconds` is greater than 0 and it is not the last exercise, the runner switches to a rest screen with its own countdown from `rest_seconds` to 0, replacing the exercise/set panel. Reaching 0 plays a short sound and automatically moves to the next exercise. A "Saltar descanso" button ends the rest immediately (no sound) and moves to the next exercise right away; pressing it twice, or any interaction after the phase has already advanced, has no further effect. Navigating away manually (previous/next buttons, the exercise list) cancels any pending rest. If `rest_seconds` is 0 — the value every routine had before v1.3 — nothing changes: the runner behaves exactly as it always did, requiring manual navigation to the next exercise.

## Calendar

### CAL-01 View
View routines assigned to dates.

### CAL-02 Assign
Assign a routine to a date.

### CAL-03 One routine per date
A date holds at most one routine. Assigning a routine to a date that already has one replaces it after confirmation.

### CAL-04 Day status
Every date shows one of three states, computed as defined in METRICS.md section 7:
- Programado (scheduled)
- Completado (completed)
- Sin entrenar (not trained)

### CAL-05 Status markers and legend
Each date with a state shows a colored dot: blue for scheduled, green for completed, amber for not trained. The calendar displays a legend with the three states. State is also available as text (tooltip and accessible label), never as color alone.

### CAL-06 Date detail
Selecting a date shows: routine name, total exercises, total sets, workout status, and total volume, as defined in METRICS.md section 8. For scheduled and not-trained dates the volume is the planned volume and is labelled as such.

### CAL-07 Actions by state
- Scheduled: start workout, change routine, remove from date.
- Not trained: start workout (it completes that date), change routine, remove from date.
- Completed: open the workout summary. Changing or removing the routine is not offered.
- No routine: assign routine.

### CAL-08 Calendar loading
The month view loads the assignments and completed workouts for the visible range and supports loading and error states with retry.

## Home

### HOME-01 Today's routine
Home shows the routine assigned for today with a start action. Starting it stores today's date as the fulfilled date.

### HOME-02 Meals today
Home shows how many of the five meal slots are registered today.

### HOME-03 Recent workouts
Home lists the most recent completed and abandoned workouts with a link to the history.

### HOME-04 Monthly progress
Home shows a progress section for the current month with four metrics, as defined in METRICS.md:
- Entrenamientos este mes
- Series realizadas
- Volumen acumulado
- Ejercicios con más peso

### HOME-05 Increased-weight detail
The "Ejercicios con más peso" metric lists the exercises that count, each with its gain in kg.

### HOME-06 Progress states
The progress section supports loading, error with retry, and an empty state when there are no completed workouts this month. It links to the Progreso page.

## Progress

### PROG-01 Exercise progression chart
A line chart shows the top weight per completed workout for one exercise over time, as defined in METRICS.md section 4.

### PROG-02 Chart range and summary
The chart offers range options (1 mes, 3 meses, 6 meses, Todo; default 3 meses) and a summary with first weight, current weight, best weight, and total change in kg.

### PROG-03 Chart tooltip
Selecting a point shows the workout date and the sets performed in that workout.

### PROG-04 Chart entry points
The chart is available from:
- the exercise rows of the routine editor;
- the current exercise of the workout runner, in a dialog or sheet that never affects the timer;
- the exercise explorer;
- the Progreso page, through an exercise selector.

### PROG-05 Chart states
The chart supports loading, error with retry, no history ("Aún no has entrenado este ejercicio con peso"), and a single-point state that asks for at least two workouts to show a trend.

### PROG-06 Sets per muscle group per week
The Progreso page shows, for the selected week, the number of performed sets for every muscle group, with a bar per group, the week total, and the change versus the previous week (METRICS.md section 6).

### PROG-07 Week navigation
The user can move to the previous and next week and return to the current week. Future weeks are not selectable. The default is the current week.

### PROG-08 Group breakdown
Each muscle group can be expanded to show the exercises that contributed and their set counts.

### PROG-09 Progress page states
The page supports loading, error with retry, and an empty week state.

## Meals

### MEAL-01 Daily slots
Each day has exactly five meal slots.

### MEAL-02 Description
Each slot stores a short description.

### MEAL-03 Meal type
Each record identifies its meal type.

## Administration

### ADM-01 Users
Admins can manage users.

### ADM-02 Exercises
Admins can manage official exercises.

### ADM-03 Requests
Admins can review exercise proposals.

### ADM-04 Full access
Admins retain all normal-user functionality.

## Cross-cutting requirements

- Responsive desktop/mobile UI. The bottom navigation holds six items without horizontal scrolling.
- Derived values (volume, sets, progression, calendar status) use only the definitions in METRICS.md; no screen redefines them.
- Charts and status markers never rely on color alone.
- Mobile workout execution has large touch targets.
- Consistent validation and error states.
- User-owned records must be isolated through authorization rules.
- Admin-only operations must be enforced server-side, not only by hiding UI.

---

# Features v1.4 — Additions

## Profile

### PROF-04 Body weight history
A user can log their body weight (in kg) with an optional date and note. One record per day maximum (upsert on conflict). The history is displayed as a line chart with range filters (1 mes, 3 meses, 6 meses, Todo), three summary stats (Inicio / Actual / Cambio), a dashed average reference line, and an expandable table of all entries with per-row delta vs the previous entry. Entries can be deleted with confirmation. Available on both the Profile page and the Progress page.

## Routines

### RT-13 Duplicate routine
A user can duplicate any of their routines. The copy is created with the name «original name» (copia), preserving all exercises (in the same order), their mode and rest_seconds, and all sets with their planned weight, reps, and duration. Calendar assignments are not copied. If the operation fails after the routine row is created, the partial copy is deleted (best-effort rollback). Success and error are communicated via toast.

## Home

### HOME-07 Training streak
Home shows a StreakCard with the user's current training streak and best streak, computed as defined in METRICS.md section 9. The card shows a flame icon, seven dot indicators for the last seven days, and a "¡Hoy entrenado!" badge when the user has already trained today.

## Cross-cutting

### Notification toasts
Every create, update, delete and assign action across the app emits a toast notification (success / error / info) via a global ToastProvider mounted at the root. Toasts auto-dismiss after 4 seconds and can be closed manually.

### Page transition animations
Navigating between the six main tabs slides the content in from the correct direction (right when going forward in tab order, left when going back). Sub-pages (editor, history, admin) fade up. The active tab icon in the mobile bottom nav performs a pop animation and a dot indicator animates in at the top of the icon.

## Workouts — v1.4 additions

### WK-13 Personal records (PRs)
When a set is completed during a workout and its recorded weight is a new personal record for that exercise (as defined in METRICS.md section 10), a PRBanner appears above the "Completar serie" button celebrating the achievement. The banner shows the exercise name and new record weight, auto-dismisses after 4 seconds with a visible countdown bar, and can be tapped to close immediately. Only one banner is shown at a time. Time-mode sets and sets without weight are excluded from PR detection.

## Workouts — WK-14 Replace exercise during session

A user can substitute any exercise in a workout session for any other exercise from the catalogue, at any time during the session (before, during or after completing sets of that exercise).

**Entry point:** a swap icon button (⇄) next to the GIF and progression buttons in the exercise header. Tapping it opens the `ReplaceExerciseModal`.

**ReplaceExerciseModal:**
- Shows all active catalogue exercises (same source as the explorer).
- Full-text search by name (client-side, instant).
- Single-selection list; the selected exercise is highlighted and labelled "Seleccionado".
- Confirms with a "Usar «name»" primary button, disabled until a selection is made.
- Warns the user that already-completed sets will be reset.

**Replacement logic (client + server):**
1. `workout_exercises.exercise_id` and `exercise_name_snapshot` are updated to the new exercise.
2. All `workout_sets` belonging to that `workout_exercise` that have a `completed_at` are cleared (`completed_at = null`, `actual_weight_kg = null`, `actual_reps = null`). Planned values (weight, reps, duration) are preserved — the user only needs to redo the actual recording.
3. The PR cache for the replaced exercise is invalidated so PR detection works correctly for the new exercise from the first set.
4. The local exercise list is updated in-place (no page reload) and the first set of the new exercise is automatically selected.
5. A success toast confirms the change; an error toast appears on failure with no state mutation.

**Constraints:**
- Only the current exercise can be substituted from the runner (no swapping arbitrary exercises mid-list).
- The routine template is not modified — only the workout session snapshot is changed.
- The history record will reflect the exercise actually performed, not the originally planned one.
