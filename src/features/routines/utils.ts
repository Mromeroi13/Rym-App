import type { RoutineExerciseDraft, RoutineDraft, RoutineSetDraft, RoutineWithDetails } from './types'

export function newKey(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function emptySet(): RoutineSetDraft {
  return { key: newKey(), plannedWeight: '', plannedReps: '', plannedDuration: '' }
}

export function emptyDraft(): RoutineDraft {
  return { name: '', description: '', exercises: [] }
}

export function draftFromRoutine(routine: RoutineWithDetails): RoutineDraft {
  return {
    name: routine.name,
    description: routine.description ?? '',
    exercises: routine.routine_exercises.map(
      (re): RoutineExerciseDraft => ({
        key: newKey(),
        exerciseId: re.exercise_id,
        exerciseName: re.exercises?.name ?? 'Ejercicio',
        muscleGroupName: re.exercises?.muscle_groups?.name ?? null,
        gifUrl: re.exercises?.gif_url ?? null,
        mode: re.mode,
        restSeconds: String(re.rest_seconds ?? 0),
        sets: re.routine_sets.map((s) => ({
          key: newKey(),
          plannedWeight: s.planned_weight_kg !== null ? String(s.planned_weight_kg) : '',
          plannedReps: s.planned_reps !== null ? String(s.planned_reps) : '',
          plannedDuration: s.planned_duration_seconds !== null ? String(s.planned_duration_seconds) : '',
        })),
      }),
    ),
  }
}

// "4 × 8-10", "3 × 12", "3 series" o "Sin series". En modo "time" muestra segundos.
export function summarizeSets(
  sets: { planned_reps: number | null; planned_duration_seconds?: number | null }[],
  mode: 'reps' | 'time' = 'reps',
): string {
  if (sets.length === 0) return 'Sin series'
  if (mode === 'time') {
    const durations = sets.map((s) => s.planned_duration_seconds).filter((d): d is number => d != null)
    if (durations.length === 0) return `${sets.length} series`
    const min = Math.min(...durations)
    const max = Math.max(...durations)
    return `${sets.length} × ${min === max ? `${min} s` : `${min}-${max} s`}`
  }
  const reps = sets.map((s) => s.planned_reps).filter((r): r is number => r !== null)
  if (reps.length === 0) return `${sets.length} series`
  const min = Math.min(...reps)
  const max = Math.max(...reps)
  return `${sets.length} × ${min === max ? min : `${min}-${max}`}`
}

export function countSets(routine: RoutineWithDetails): number {
  return routine.routine_exercises.reduce((total, re) => total + re.routine_sets.length, 0)
}
