# RyM App — Development Rules v1.1

## 1. Definition of done

A feature is not considered complete until:
- UI is implemented;
- data model/migrations are updated when required;
- authorization/RLS is updated when required;
- validation is implemented;
- tests are updated/added;
- documentation is updated;
- the application builds successfully.

## 2. Change workflow

For every requirement change:

1. Describe the requirement.
2. Update the appropriate documentation.
3. Identify affected features.
4. Identify database changes.
5. Identify authorization/security changes.
6. Implement.
7. Test.
8. Review responsive UI.
9. Update documentation.
10. Commit as a coherent change.

## 3. Code quality

Prefer:
- small components;
- feature-oriented modules;
- typed data;
- explicit states;
- reusable primitives;
- clear naming;
- minimal duplication.

Avoid:
- giant page components;
- duplicated business logic;
- hidden authorization assumptions;
- direct database access scattered throughout UI components;
- mixing routine-template logic with workout-history logic.

## 4. Testing priorities

Test at minimum:
- authentication;
- ownership isolation;
- admin authorization;
- routine CRUD;
- independent routine sets;
- workout snapshot behavior;
- actual-vs-planned workout values;
- timer pause/resume/continuity;
- five meal slots;
- exercise proposal workflow;
- metrics: volume, sets performed, exercise top weight, increased-weight rule, weekly sets per muscle group, and calendar status, including the examples in METRICS.md;
- favorites ownership isolation and uniqueness;
- calendar status edge cases: today, past date without workout, workout done on a later day, free workout, abandoned workout.

## 5. AI-assisted development

Ollama/Gemma may:
- inspect repository documentation;
- explain code;
- propose implementations;
- generate tests;
- update documentation;
- identify affected files.

Gemma must not be treated as:
- an authorization mechanism;
- a production decision maker;
- a replacement for tests;
- an authoritative source of requirements.

The repository specification remains authoritative.

## 6. Suggested development order

Phase 1:
- project bootstrap
- design tokens
- routing
- shared layout/navigation
- authentication

Phase 2:
- profile
- exercise catalog
- exercise proposals

Phase 3:
- routine creation/editing/detail
- routine sets
- calendar assignments

Phase 4:
- workout session creation
- workout execution
- timer
- completion/history

Phase 5:
- meals

Phase 6:
- admin users/exercises/proposals

Phase 7:
- hardening
- RLS review
- responsive QA
- tests
- documentation

Phase 8 (v1.1 — progress and smarter calendar):
- database: `workout_sessions.scheduled_date`, `favorite_exercises` with RLS, indexes, updated types and base schema
- shared metrics module with unit tests (add Vitest)
- favorite exercises in the exercise picker and explorer
- scheduled date on workout start, smart calendar states and date detail
- monthly progress section on Home
- Progreso page: sets per muscle group per week
- exercise progression chart and its entry points
- navigation update, responsive QA, documentation
