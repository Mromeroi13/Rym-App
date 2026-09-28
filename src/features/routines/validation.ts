import type { RoutineDraft } from './types'

export interface DraftErrors {
  name?: string
  exercises?: string
  // errores por ejercicio (clave = key del ejercicio)
  exerciseSets: Record<string, string>
  // errores por serie (clave = key de la serie)
  sets: Record<string, { weight?: string; reps?: string }>
}

export function validateDraft(draft: RoutineDraft): DraftErrors {
  const errors: DraftErrors = { exerciseSets: {}, sets: {} }

  if (draft.name.trim().length < 2) {
    errors.name = 'El nombre debe tener al menos 2 caracteres'
  } else if (draft.name.trim().length > 80) {
    errors.name = 'El nombre no puede superar los 80 caracteres'
  }

  if (draft.exercises.length === 0) {
    errors.exercises = 'Añade al menos un ejercicio a la rutina'
  }

  for (const exercise of draft.exercises) {
    if (exercise.sets.length === 0) {
      errors.exerciseSets[exercise.key] = 'Añade al menos una serie'
    }
    for (const set of exercise.sets) {
      const setErrors: { weight?: string; reps?: string } = {}
      const weight = set.plannedWeight.trim()
      const reps = set.plannedReps.trim()

      if (weight !== '') {
        const w = Number(weight)
        if (Number.isNaN(w) || w < 0 || w > 1000) setErrors.weight = 'Peso no válido'
      }
      if (reps !== '') {
        const r = Number(reps)
        if (!Number.isInteger(r) || r < 1 || r > 999) setErrors.reps = 'Reps no válidas'
      }
      if (setErrors.weight || setErrors.reps) errors.sets[set.key] = setErrors
    }
  }

  return errors
}

export function hasErrors(errors: DraftErrors): boolean {
  return (
    !!errors.name ||
    !!errors.exercises ||
    Object.keys(errors.exerciseSets).length > 0 ||
    Object.keys(errors.sets).length > 0
  )
}
