import { supabase } from '@/lib/supabase'
import { toDateKey } from '@/utils/dates'
import type { Database } from '@/types/database.types'
import type { RoutineWithDetails } from '@/features/routines/types'
import type { OpenWorkout, WorkoutListItem, WorkoutWithDetails } from './workoutTypes'

const WORKOUT_SELECT =
  '*, routines(name), workout_exercises(id, exercise_id, exercise_name_snapshot, position, mode, rest_seconds, exercises(gif_url, muscle_groups(name)), workout_sets(*))'

type SessionUpdate = Database['public']['Tables']['workout_sessions']['Update']

function normalize(workout: WorkoutWithDetails): WorkoutWithDetails {
  return {
    ...workout,
    workout_exercises: [...workout.workout_exercises]
      .sort((a, b) => a.position - b.position)
      .map((we) => ({
        ...we,
        workout_sets: [...we.workout_sets].sort((a, b) => a.set_number - b.set_number),
      })),
  }
}

export async function fetchWorkout(id: string): Promise<WorkoutWithDetails | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(WORKOUT_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? normalize(data as unknown as WorkoutWithDetails) : null
}

export async function fetchOpenWorkout(userId: string): Promise<OpenWorkout | null> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, status, routines(name)')
    .eq('user_id', userId)
    .in('status', ['active', 'paused'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const row = data as unknown as { id: string; status: 'active' | 'paused'; routines: { name: string } | null }
  return { id: row.id, status: row.status, routineName: row.routines?.name ?? null }
}

export async function fetchHistory(): Promise<WorkoutListItem[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*, routines(name), workout_exercises(id, workout_sets(id, completed_at))')
    .in('status', ['completed', 'abandoned'])
    .order('started_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return (data ?? []) as unknown as WorkoutListItem[]
}

/**
 * Devuelve el mejor peso registrado históricamente para un ejercicio
 * en sesiones YA completadas (excluye la sesión activa).
 * Devuelve null si el usuario nunca ha entrenado ese ejercicio con peso.
 */
export async function fetchBestWeightForExercise(
  exerciseId: string,
  currentSessionId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('actual_weight_kg, workout_exercises!inner(exercise_id, workout_session_id)')
    .eq('workout_exercises.exercise_id', exerciseId)
    .neq('workout_exercises.workout_session_id', currentSessionId)
    .not('actual_weight_kg', 'is', null)
    .order('actual_weight_kg', { ascending: false })
    .limit(1)
  if (error) throw error
  const row = data?.[0] as { actual_weight_kg: number } | undefined
  return row?.actual_weight_kg ?? null
}
 /*
 al menos un entrenamiento. Usado para calcular la racha sin cargar todo el historial.
 */

/**
 * Devuelve el conjunto de fechas ('YYYY-MM-DD') en las que el usuario completó
 * al menos un entrenamiento. Usado para calcular la racha sin cargar todo el historial.
 */
export async function fetchCompletedDates(): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('started_at, scheduled_date')
    .eq('status', 'completed')
  if (error) throw error
  const dates = new Set<string>()
  for (const row of data ?? []) {
    if (row.scheduled_date) {
      dates.add(row.scheduled_date)
    } else {
      const d = new Date(row.started_at)
      dates.add(toDateKey(d))
    }
  }
  return dates
}

/**
 * Crea la sesión de entrenamiento como una FOTO de la rutina: copia ejercicios, nombres
 * y valores planificados. Editar o borrar la rutina después no altera este entrenamiento.
 * `scheduledDate` es la fecha que este entrenamiento cumple en el calendario (WK-09):
 * se pasa solo cuando se inicia desde una asignación (Calendario u Home); un inicio
 * libre no lleva fecha y cumple el día en que se inicia.
 */
export async function startWorkout(
  userId: string,
  routine: RoutineWithDetails,
  timerEnabled: boolean,
  scheduledDate: string | null = null,
): Promise<string> {
  const { data: session, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: userId,
      source_routine_id: routine.id,
      timer_enabled: timerEnabled,
      status: 'active',
      scheduled_date: scheduledDate,
    })
    .select('id')
    .single()
  if (error) throw error

  try {
    const { data: inserted, error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(
        routine.routine_exercises.map((re, index) => ({
          workout_session_id: session.id,
          exercise_id: re.exercise_id,
          exercise_name_snapshot: re.exercises?.name ?? 'Ejercicio',
          position: index,
          mode: re.mode,
          rest_seconds: re.rest_seconds,
        })),
      )
      .select('id, position')
    if (exercisesError) throw exercisesError

    const idByPosition = new Map((inserted ?? []).map((row) => [row.position, row.id]))
    const setRows = routine.routine_exercises.flatMap((re, index) => {
      const workoutExerciseId = idByPosition.get(index)
      if (!workoutExerciseId) throw new Error('No se pudo copiar un ejercicio de la rutina')
      return re.routine_sets.map((set) => ({
        workout_exercise_id: workoutExerciseId,
        set_number: set.set_number,
        planned_weight_kg: set.planned_weight_kg,
        planned_reps: set.planned_reps,
        planned_duration_seconds: set.planned_duration_seconds,
      }))
    })
    if (setRows.length > 0) {
      const { error: setsError } = await supabase.from('workout_sets').insert(setRows)
      if (setsError) throw setsError
    }
  } catch (err) {
    await supabase.from('workout_sessions').delete().eq('id', session.id)
    throw err
  }

  return session.id
}

// Registra los valores REALES de una serie (independientes de los planificados).
export async function saveSetResult(setId: string, weight: number | null, reps: number): Promise<string> {
  const completedAt = new Date().toISOString()
  const { error } = await supabase
    .from('workout_sets')
    .update({ actual_weight_kg: weight, actual_reps: reps, completed_at: completedAt })
    .eq('id', setId)
  if (error) throw error
  return completedAt
}

// Marca como completada una serie de un ejercicio por tiempo: la cuenta atrás ya
// fue el "registro", así que aquí no hay peso/reps reales que guardar (WK-11).
export async function completeTimedSet(setId: string): Promise<string> {
  const completedAt = new Date().toISOString()
  const { error } = await supabase.from('workout_sets').update({ completed_at: completedAt }).eq('id', setId)
  if (error) throw error
  return completedAt
}

export async function clearSetCompletion(setId: string): Promise<void> {
  const { error } = await supabase.from('workout_sets').update({ completed_at: null }).eq('id', setId)
  if (error) throw error
}

export async function updateWorkoutSession(id: string, patch: SessionUpdate): Promise<void> {
  const { error } = await supabase.from('workout_sessions').update(patch).eq('id', id)
  if (error) throw error
}
