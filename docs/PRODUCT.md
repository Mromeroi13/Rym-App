# RyM App — Product Specification v1.0

## 1. Product

RyM App is a responsive fitness web application for planning routines, scheduling workouts, recording actual training performance, tracking daily meals, and managing an exercise library.

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

## 3. Main navigation

All authenticated users see:

1. Inicio
2. Calendario
3. Rutinas
4. Comidas
5. Perfil

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

### Calendar
- View assigned routines by date.
- Assign routines to dates.
- The exact v1 rule for multiple routines on one date must be explicitly decided before implementation if the UI permits it.

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
- advanced analytics
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
