import type { WorkoutSetRow, WorkoutWithDetails } from './workoutTypes'

export interface SetInput {
  weight: string
  reps: string
}

export function formatNumber(n: number): string {
  return String(Math.round(n * 100) / 100)
}

export function toInput(weight: number | null, reps: number | null): SetInput {
  return {
    weight: weight !== null ? formatNumber(weight) : '',
    reps: reps !== null ? String(reps) : '',
  }
}

// Valor inicial de los campos de una serie: lo real si ya se registró; si no, lo planificado.
export function baseInput(set: WorkoutSetRow): SetInput {
  if (set.completed_at) return toInput(set.actual_weight_kg, set.actual_reps)
  return toInput(set.actual_weight_kg ?? set.planned_weight_kg, set.actual_reps ?? set.planned_reps)
}

export function parseSetInput(input: SetInput): { weight: number | null; reps: number } | { error: string } {
  const weightText = input.weight.trim()
  const repsText = input.reps.trim()

  let weight: number | null = null
  if (weightText !== '') {
    weight = Number(weightText)
    if (Number.isNaN(weight) || weight < 0 || weight > 1000) return { error: 'Introduce un peso válido (0-1000 kg).' }
  }
  const reps = Number(repsText)
  if (repsText === '' || !Number.isInteger(reps) || reps < 1 || reps > 999) {
    return { error: 'Introduce las repeticiones realizadas (1-999).' }
  }
  return { weight, reps }
}

export function formatSetValues(weight: number | null, reps: number | null): string {
  if (reps === null && weight === null) return '—'
  if (weight === null) return `${reps} reps`
  if (reps === null) return `${formatNumber(weight)} kg`
  return `${formatNumber(weight)} kg × ${reps}`
}

// "60 a 70 kg × 8-12", "24 kg × 10", "Sin peso × 12"
export function summarizePlanned(
  sets: { planned_weight_kg: number | null; planned_reps: number | null }[],
): string {
  const weights = sets.map((s) => s.planned_weight_kg).filter((v): v is number => v !== null)
  const reps = sets.map((s) => s.planned_reps).filter((v): v is number => v !== null)
  const weightText =
    weights.length === 0
      ? 'Sin peso'
      : Math.min(...weights) === Math.max(...weights)
        ? `${formatNumber(weights[0])} kg`
        : `${formatNumber(Math.min(...weights))} a ${formatNumber(Math.max(...weights))} kg`
  if (reps.length === 0) return weightText
  const repsText = Math.min(...reps) === Math.max(...reps) ? `${reps[0]}` : `${Math.min(...reps)}-${Math.max(...reps)}`
  return `${weightText} × ${repsText}`
}

export function workoutTotals(workout: WorkoutWithDetails) {
  const allSets = workout.workout_exercises.flatMap((e) => e.workout_sets)
  const done = allSets.filter((s) => s.completed_at)
  const volumeKg = done.reduce(
    (sum, s) => sum + (s.actual_weight_kg ?? 0) * (s.actual_reps ?? 0),
    0,
  )
  const exercisesDone = workout.workout_exercises.filter(
    (e) => e.workout_sets.length > 0 && e.workout_sets.every((s) => s.completed_at),
  ).length
  return { totalSets: allSets.length, completedSets: done.length, volumeKg, exercisesDone }
}
