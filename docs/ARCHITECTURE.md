# RyM App — Architecture v1.0

## 1. Recommended stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

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
- admin

Shared UI belongs in reusable components.

### Database-first contracts

Types and validation should reflect the database model.

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

## 6. AI development workflow

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
