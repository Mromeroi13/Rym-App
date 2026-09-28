import type { Tables } from '@/types/database.types'

// ---- Lectura (forma que devuelve Supabase) ----
export type RoutineSetRow = Tables<'routine_sets'>

export interface RoutineExerciseDetail {
  id: string
  exercise_id: string
  position: number
  exercises: { name: string; muscle_groups: { name: string } | null } | null
  routine_sets: RoutineSetRow[]
}

export type RoutineWithDetails = Tables<'routines'> & {
  routine_exercises: RoutineExerciseDetail[]
}

// ---- Edición (borrador en el formulario; los números viajan como texto) ----
export interface RoutineSetDraft {
  key: string
  plannedWeight: string
  plannedReps: string
}

export interface RoutineExerciseDraft {
  key: string
  exerciseId: string
  exerciseName: string
  muscleGroupName: string | null
  sets: RoutineSetDraft[]
}

export interface RoutineDraft {
  name: string
  description: string
  exercises: RoutineExerciseDraft[]
}
