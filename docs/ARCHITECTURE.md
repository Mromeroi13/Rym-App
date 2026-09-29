# RyM App — Architecture v1.1

## 1. Recommended stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts (line and bar charts)

### Testing
- Vitest for unit tests of pure logic, especially metrics

### Backend
- Supabase
  - PostgreSQL
  - Auth
  - Row Level Security
  - migrations

### Local AI development
- Ollama
- Gemma

Gemma is a development assistant, not a trusted authorization layer and not the source of truth for application permissions.

## 2. Architectural principles

### Feature-oriented code

Prefer feature boundaries such as:

- auth
- profile
- exercises
- routines
- workouts
- calendar
- meals
- home
- progress
- admin

Shared UI belongs in reusable components.

### Database-first contracts

Types and validation should reflect the database model.

### One definition per metric

Volume, set counts, weight progression, weekly sets and calendar status are defined once in METRICS.md and implemented once, as pure functions in `features/progress/metrics.ts`. Home, Calendar, Progress and the workout summary import them. Components fetch data through typed API modules and pass it to these functions; they do not recompute metrics inline.

### Server-enforced security

UI visibility is not authorization.

Admin permissions and ownership rules must be enforced by Supabase/PostgreSQL RLS and appropriate server-side operations.

## 3. Suggested source structure

```text
src/
  components/
  layouts/
  pages/
  features/
    auth/
    profile/
    exercises/
    routines/
    workouts/
    calendar/
    meals/
    home/
    progress/
    admin/
  hooks/
  lib/
  types/
  utils/
```

## 4. Runtime concepts

### Routine
Reusable plan/template.

### Workout session
Historical execution created from a routine at a specific start.

### Planned set
What the routine intended.

### Actual set
What the user actually performed.

These concepts must not be collapsed into one record.

### Derived metric
A value computed from completed workouts: volume, sets per muscle group, weight progression, calendar status. Derived metrics are computed on read, never stored.

## 5. State handling

The UI should explicitly model:
- idle
- loading
- editing
- saving
- success
- validation error
- server error
- empty state

Workout execution additionally needs:
- preparing
- active
- paused
- completed
- exit confirmation
- unrecoverable/error state

## 6. Derived metrics data loading

- Fetch bounded ranges: the visible month for Calendar and Home, the selected week (and the previous one) for weekly sets, and one exercise for its chart.
- Calculations run in the client on the fetched rows. If volume of data grows, move them to database views with security invoker or RPC functions without changing METRICS.md.
- Every chart or metric block models loading, empty and error states.
- The chart library is loaded lazily on the routes and dialogs that use it, to keep workout execution light on mobile.

## 7. AI development workflow

Requirement change:

```text
Requirement
    ↓
Update specification
    ↓
Impact analysis
    ↓
Database/security changes if needed
    ↓
Implementation
    ↓
Tests
    ↓
Documentation
```

Gemma should inspect the repository documentation before proposing code changes.
