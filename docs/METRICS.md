# RyM App — Metrics Definitions v1.1

This document is the single source of truth for every derived value shown in the app: volume, set counts, weight progression, weekly sets per muscle group, and calendar status.

No screen may redefine these rules. Implementation lives in one shared module of pure functions (`features/progress/metrics.ts`) that Home, Calendar, Progress and the workout summary all use.

## 1. Data scope

- Only workouts with status `completed` are used.
- Only sets with `completed_at` set are "performed sets".
- Metrics use **actual** values (`actual_weight_kg`, `actual_reps`). Planned values are used only for the "planned volume" shown on scheduled and not-trained calendar days.
- Abandoned, active and paused workouts never contribute.
- An exercise is identified by `exercise_id`, not by its name snapshot.

## 2. Time rules

- All dates use the user's local time zone.
- The **session date** of a workout is the local date of `started_at`.
- A **week** runs Monday to Sunday.
- A **month** is a calendar month.

## 3. Basic quantities

| Quantity | Definition |
|---|---|
| Workouts | Number of completed workouts in the period. Two workouts on the same day count as two. |
| Sets performed | Number of performed sets, with or without weight. |
| Volume (kg) | Sum of `actual_weight_kg × actual_reps` over performed sets. A set without weight contributes 0. |
| Planned volume (kg) | Sum of `planned_weight_kg × planned_reps` over the planned sets of a routine. Missing values contribute 0. |

Volume is displayed in kg, rounded to at most one decimal, with the es-ES thousands separator (for example `12.450 kg`).

Example: sets of 60 kg × 8, 60 kg × 8 and 57.5 kg × 6 give 480 + 480 + 345 = 1.305 kg.

## 4. Exercise weight progression

- **Top weight of a session** for an exercise: the highest `actual_weight_kg` among its performed sets with weight greater than 0.
- A workout with no weighted performed set for that exercise produces no point.
- The progression chart plots one point per completed workout: session date on X, top weight in kg on Y.
- The point tooltip lists the performed sets of that workout (for example `60 kg × 8 · 60 kg × 8 · 57,5 kg × 6`).

## 5. Exercises with increased weight (Home)

For an exercise and the current month:

- `monthMax` = the highest top weight among its completed workouts in the month.
- `reference` = the top weight of its most recent completed workout **before** the month; if there is none, the top weight of its first completed workout **in** the month.
- The exercise counts as "lifted more weight" when `monthMax > reference`.
- The gain shown is `monthMax − reference`.

Examples:

- Bench press: last workout before the month at 80 kg; this month 82.5 and 85 → counts, +5 kg.
- Squat, first performed this month: 60 kg then 62.5 kg → reference 60, counts, +2.5 kg.
- Row, a single workout this month and nothing before → reference equals monthMax, does not count.

The Home metric "ejercicios con más peso" is the number of exercises that count.

## 6. Sets per muscle group per week

- Group performed sets by the exercise's muscle group and by the week of the session date.
- The muscle group is read from the exercise's current group. If an admin later changes an exercise's group, past weeks are recalculated with the new group.
- Every muscle group in the catalog is listed, including groups with 0 sets.
- The week total is the sum over all groups.
- The change versus the previous week is `sets(week) − sets(previous week)` per group.
- Each group can be expanded to list the exercises that contributed and their set counts.

## 7. Calendar day status

For a date `D` of the visible month:

- `A` = the routine assignment on `D`, if any (at most one).
- `S(D)` = completed workouts that fulfill `D`: those with `scheduled_date = D`, plus those with no `scheduled_date` whose session date is `D`.

| Condition | Status | Marker |
|---|---|---|
| `S(D)` is not empty | Completed ("Completado") | Green dot |
| `S(D)` is empty, `A` exists, `D` is today or later | Scheduled ("Programado") | Blue dot |
| `S(D)` is empty, `A` exists, `D` is before today | Not trained ("Sin entrenar") | Amber dot |
| No assignment and no completed workout | No marker | — |

Rules:

- Today with a routine and no completed workout is Scheduled until the workout is completed.
- An abandoned, active or paused workout never makes a day Completed.
- A workout started from an assignment stores that assignment's date in `scheduled_date`, so a workout done a day late still completes the planned day.
- A workout started without an assignment (free start) has no `scheduled_date` and completes the day it was started.
- Status is never stored. It is recomputed from assignments and workouts.

## 8. Calendar day detail

The detail shows, for the selected date:

| Field | Completed | Scheduled / Not trained |
|---|---|---|
| Routine name | Source routine of the workout, or "Entrenamiento" if the routine no longer exists | Name of the assigned routine |
| Exercises | Number of exercises in the workout | Number of exercises in the routine |
| Sets | Performed sets out of total sets (for example `14 de 16 series`) | Total planned sets |
| Status | Completado | Programado / Sin entrenar |
| Volume | Total volume (section 3) | Planned volume, labelled "Volumen planificado" |

If several completed workouts fulfill the same date, each one is shown as its own block.

## 9. Training streak

The streak is computed from the set of calendar dates on which the user completed at least one workout (status = `completed`). Abandoned, active and paused workouts are excluded.

**Date resolution rule** (same as section 7):
A completed workout's date is its `scheduled_date` when present; otherwise the local calendar date of `started_at`.

**Current streak** (`current`):
Starting from today and stepping backwards one day at a time, count every consecutive day that has at least one completed workout. If the user has already trained today, the count starts from today; otherwise it starts from yesterday (so the streak is not reset merely because today's workout has not been done yet). A gap of even one day resets the count.

**Best streak** (`best`):
The longest sequence of consecutive days with at least one completed workout across the entire history.

**Display (Home → StreakCard)**:
- Numeric count of `current` days.
- Flame icon — filled and colored when `current > 0`, outline when 0.
- Seven dot indicators for the last seven days (filled = trained, empty = not trained).
- If `current > 7` the overflow is shown as `+N` after the dots.
- `best` shown below as secondary text.
- A "¡Hoy entrenado!" badge when `trainedToday` is true.
- On error the card is hidden (no crash, no blank space).

## 10. Personal records (PRs)

A personal record is detected in real time during a workout execution, immediately after a set is saved.

**Condition:** a set is a PR when `actual_weight_kg > previous_best`, where `previous_best` is the highest `actual_weight_kg` ever recorded for that exercise across all prior completed sessions (excluding the current one). If the user has never recorded a weight for that exercise before, the first set with weight > 0 is also a PR.

**Exclusions:** time-mode sets (no weight) and sets with `actual_weight_kg = null` or ≤ 0 are never PRs.

**Cache:** the best weight per exercise is fetched once per exercise per session (on the first completed set for that exercise) and cached in memory for the rest of the session. After a PR is detected the cache is updated to the new value, so a second PR within the same session requires beating the first.

**Display:** a `PRBanner` appears above the "Completar serie" button. It shows the exercise name, the new record weight, and auto-dismisses after 4 seconds. A progress bar visualises the remaining time. Tapping the banner dismisses it immediately. Only one PR banner is shown at a time; a new PR replaces any previous one still visible.
