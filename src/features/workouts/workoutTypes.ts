import type { Tables } from '@/types/database.types'

export type WorkoutSetRow = Tables<'workout_sets'>

export interface WorkoutExerciseDetail {
  id: string
  exercise_id: string
  exercise_name_snapshot: string
  position: number
  exercises: { gif_url: string | null; muscle_groups: { name: string } | null } | null
  workout_sets: WorkoutSetRow[]
}

export type WorkoutWithDetails = Tables<'workout_sessions'> & {
  routines: { name: string } | null
  workout_exercises: WorkoutExerciseDetail[]
}

export type WorkoutListItem = Tables<'workout_sessions'> & {
  routines: { name: string } | null
  workout_exercises: { id: string; workout_sets: { id: string; completed_at: string | null }[] }[]
}

export interface OpenWorkout {
  id: string
  status: 'active' | 'paused'
  routineName: string | null
}
