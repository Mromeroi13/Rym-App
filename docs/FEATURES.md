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
