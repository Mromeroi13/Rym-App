# RyM App — v1.1 Specification

This folder contains the product and engineering specification for RyM App.

## Documents

- PRODUCT.md — product scope and principles
- FEATURES.md — feature requirements
- ARCHITECTURE.md — application architecture
- DATABASE.md — logical data model
- AUTH.md — authentication and authorization
- DESIGN.md — visual system
- METRICS.md — definitions of derived metrics and calendar status
- DEVELOPMENT.md — development process and definition of done

## Source of truth

These documents define the intended v1 behavior.

Stitch exports are UI references.

When a requirement changes, update the documentation first, then implement the change and update tests/security/docs as needed.

## v1.1 changes

Requirement: progress tracking, a smarter calendar and favorite exercises.

Added:
- Weight progression line chart per exercise.
- Monthly progress section on Home.
- Calendar day status (scheduled, completed, not trained) with day detail.
- Progreso page with sets per muscle group per week.
- Favorite exercises in the routine exercise picker.

Impact analysis:
- Features: Home, Calendar, Routines, Workouts, Progress (new).
- Database: `workout_sessions.scheduled_date` and table `favorite_exercises`; no other stored aggregates.
- Security: RLS for `favorite_exercises`; metrics read only the user's own data.
- Product: the "advanced analytics" non-goal is narrowed to what METRICS.md does not define; the calendar rule is fixed to one routine per date.
- Dependencies: Recharts (charts) and Vitest (tests).
