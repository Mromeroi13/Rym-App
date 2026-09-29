# RyM App — Product Specification v1.1

## 1. Product

RyM App is a responsive fitness web application for planning routines, scheduling workouts, recording actual training performance, reviewing training progress, tracking daily meals, and managing an exercise library.

The product has two roles:

- `user`
- `admin`

There is no trainer role.

## 2. Product principles

- Mobile-first for workout execution.
- Light mode only.
- Simple, professional fitness/SaaS experience.
- Routine templates and workout executions are separate concepts.
- Planned values and actual values are separate.
- Users own their personal routines and data.
- Admins manage the official exercise catalog and user exercise proposals.
- The interface should remain visually consistent with the Stitch design reference.
- Progress is derived from what the user actually performed, never from planned values.
- Derived metrics are computed from workout history and are not stored separately. Their definitions live in METRICS.md and are shared by every screen.

## 3. Main navigation

All authenticated users see:

1. Inicio
2. Calendario
3. Rutinas
4. Progreso
5. Comidas
6. Perfil

Admins additionally have an Administración section containing:

- Usuarios
- Ejercicios
- Solicitudes

The admin still has access to all normal-user functionality.

## 4. v1 functional scope

### Authentication
- Register.
- Log in.
- Log out.
- Password recovery/reset flow should be supported by the authentication layer.

### Profile
- View/edit name or username.
- View account email.
- Edit weight.
- Edit height.
- Save/cancel changes.
- Validation and save/error states.

### Exercises
- Official exercise has at least:
  - name
  - muscle group
- Users browse exercises by muscle group.
- Users can propose a missing exercise with:
  - name
  - muscle group
- Admin accepts/rejects proposals.
- Accepted proposals become official exercises.
- Admin manages official exercises.

### Routines
- User creates reusable routine templates.
- Routine has a name and optional description.
- Routine contains exercises.
- Each exercise can have any number of sets.
- Each set independently stores planned weight and planned repetitions.
- Exercises can be added, edited, reordered if supported by the UI, or removed.
- Routines can be assigned to calendar dates.
- Users can mark official exercises as favorites and use them to build routines faster (see Favorite exercises below).

### Home (Inicio)
- Today's assigned routine with a start action.
- Today's meals summary.
- Recent workouts.
- Monthly progress summary: workouts this month, sets performed, accumulated volume, and exercises where the user lifted more weight.

### Calendar
- View assigned routines by date.
- Assign routines to dates.
- A date holds at most one routine (decision D1).
- Each date with a routine or a completed workout shows a status marker: scheduled, completed, or not trained.
- Selecting a date shows the routine name, total exercises and sets, workout status, and total volume.

### Favorite exercises
- A user can mark and unmark any official exercise as favorite.
- Favorites are personal, are not visible to other users, and do not change the official catalog.
- When adding exercises to a routine, the user can filter by favorites and sees favorites first.

### Progress
- Line chart of weight progression per exercise.
- Number of sets per muscle group per week.
- All progress data is derived from completed workouts (METRICS.md).

### Workout execution
- Starting a routine creates a workout execution instance.
- Planned values are loaded from the routine.
- Actual weight/repetitions are recorded independently from planned values.
- Each set can have different actual values.
- User can start with or without a timer.
- If enabled, one global timer starts at workout start.
- Timer continues across exercises and sets.
- Timer can pause/resume.
- Moving to another exercise never restarts the timer.
- Workout completion stores the actual execution.
- A workout started from a calendar assignment records the date it fulfills.
- Exiting an active workout requires confirmation where data could be lost.

### Meals
Exactly five meal slots per day:

1. Desayuno
2. Snack
3. Almuerzo
4. Merienda
5. Cena

Each meal stores:
- meal type
- short description

v1 does not include:
- calories
- macros
- photos

### Administration
Admins can:
- manage users
- manage official exercises
- review exercise proposals
- accept/reject proposals

Admin users can also use every normal-user feature.

## 5. Explicit non-goals for v1

Do not add without a new product decision:
- trainer role
- social feed
- messaging
- calorie/macronutrient tracking
- food database
- meal photos
- payments/subscriptions
- advanced analytics beyond the metrics defined in METRICS.md (for example estimated 1RM, body-composition tracking, comparison between users, AI-generated insights)
- wearable integrations
- AI workout generation
- AI nutrition recommendations

## 6. Source of truth

The repository documentation is the functional source of truth. Stitch exports are design references, not the production application.

When a requirement changes:
1. update the relevant documentation;
2. assess database/security impact;
3. implement the change;
4. update tests;
5. update documentation.

## 7. Product decisions (v1.1)

- **D1. One routine per calendar date.** This matches the unique constraint already in the database and closes the open question from v1.0.
- **D2. Only completed workouts count.** Every metric uses workouts with status `completed` and sets that were actually performed. Abandoned and in-progress workouts are excluded.
- **D3. Weeks start on Monday** and all dates use the user's local time, consistent with the calendar.
- **D4. "Lifted more weight" definition.** An exercise counts when its heaviest weight this month is greater than its reference weight (exact rule in METRICS.md).
- **D5. Calendar status is derived, not stored.** It is computed from assignments and completed workouts. The only new stored field is `workout_sessions.scheduled_date`.
- **D6. Progress has its own navigation item** ("Progreso"), which brings the main navigation to six items.
- **D7. Charts use Recharts** as the single new frontend dependency.
- **D8. Unweighted sets** (bodyweight exercises) count as sets but contribute 0 to volume and are ignored in weight charts.
