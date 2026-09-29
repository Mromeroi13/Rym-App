// Acceso a datos para las métricas (docs/ARCHITECTURE.md §6). Solo lee; los cálculos
// viven en metrics.ts. Todas las lecturas están acotadas: un rango de fechas o un
// ejercicio. RLS limita siempre el resultado a los datos del propio usuario.

import { supabase } from '@/lib/supabase'
import { addDaysKey, dayStartISO } from '@/utils/dates'
import type {
  CatalogExercise,
  CatalogMuscleGroup,
  MetricSet,
  MetricWorkout,
  MetricWorkoutExercise,
} from './metrics'

const SET_COLUMNS = 'set_number, planned_weight_kg, planned_reps, actual_weight_kg, actual_reps, completed_at'

const WORKOUT_SELECT = `id, status, started_at, scheduled_date, routines(name), workout_exercises(exercise_id, exercise_name_snapshot, workout_sets(${SET_COLUMNS}))`

const EXERCISE_ROWS_SELECT = `exercise_id, exercise_name_snapshot, workout_sets(${SET_COLUMNS}), workout_sessions!inner(id, status, started_at, scheduled_date)`

/**
 * Entrenamientos completados cuya fecha de sesión (fecha local de `started_at`) cae en
 * [startKey, endKey], ambos incluidos. Para Home y Progreso semanal.
 */
export async function fetchCompletedWorkoutsByStart(startKey: string, endKey: string): Promise<MetricWorkout[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(WORKOUT_SELECT)
    .eq('status', 'completed')
    .gte('started_at', dayStartISO(startKey))
    .lt('started_at', dayStartISO(addDaysKey(endKey, 1)))
    .order('started_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as MetricWorkout[]
}

/**
 * Entrenamientos completados que pueden cumplir alguna fecha de [startKey, endKey]:
 * los que empezaron en el rango o los que tienen `scheduled_date` en él. Un entrenamiento
 * hecho un día tarde puede haber empezado fuera del rango visible y aun así completar
 * una fecha visible (METRICS.md §7).
 */
export async function fetchCalendarWorkouts(startKey: string, endKey: string): Promise<MetricWorkout[]> {
  const from = dayStartISO(startKey)
  const to = dayStartISO(addDaysKey(endKey, 1))
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(WORKOUT_SELECT)
    .eq('status', 'completed')
    .or(`and(started_at.gte.${from},started_at.lt.${to}),and(scheduled_date.gte.${startKey},scheduled_date.lte.${endKey})`)
    .order('started_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as unknown as MetricWorkout[]
}

interface ExerciseRow {
  exercise_id: string
  exercise_name_snapshot: string
  workout_sets: MetricSet[]
  workout_sessions: {
    id: string
    status: MetricWorkout['status']
    started_at: string
    scheduled_date: string | null
  }
}

// Agrupa filas (ejercicio de un entrenamiento) en entrenamientos con solo esos ejercicios.
function groupRowsIntoWorkouts(rows: readonly ExerciseRow[]): MetricWorkout[] {
  const byId = new Map<string, MetricWorkout & { workout_exercises: MetricWorkoutExercise[] }>()
  for (const row of rows) {
    const session = row.workout_sessions
    let workout = byId.get(session.id)
    if (!workout) {
      workout = {
        id: session.id,
        status: session.status,
        started_at: session.started_at,
        scheduled_date: session.scheduled_date,
        routines: null,
        workout_exercises: [],
      }
      byId.set(session.id, workout)
    }
    workout.workout_exercises.push({
      exercise_id: row.exercise_id,
      exercise_name_snapshot: row.exercise_name_snapshot,
      workout_sets: row.workout_sets,
    })
  }
  return [...byId.values()]
}

/**
 * Historial completo (entrenamientos completados) de UN ejercicio, para su gráfica de
 * progresión. Solo trae las filas de ese ejercicio.
 */
export async function fetchExerciseHistory(exerciseId: string): Promise<MetricWorkout[]> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .select(EXERCISE_ROWS_SELECT)
    .eq('exercise_id', exerciseId)
    .eq('workout_sessions.status', 'completed')
  if (error) throw error
  return groupRowsIntoWorkouts((data ?? []) as unknown as ExerciseRow[])
}

/**
 * Entrenamientos completados ANTERIORES a `beforeKey` para los ejercicios dados. Home los
 * necesita para la referencia de "ejercicios con más peso": el último entrenamiento previo
 * al mes de cada ejercicio (METRICS.md §5). metrics.ts elige el más reciente.
 */
export async function fetchWorkoutsBefore(exerciseIds: readonly string[], beforeKey: string): Promise<MetricWorkout[]> {
  if (exerciseIds.length === 0) return []
  const { data, error } = await supabase
    .from('workout_exercises')
    .select(EXERCISE_ROWS_SELECT)
    .in('exercise_id', [...exerciseIds])
    .eq('workout_sessions.status', 'completed')
    .lt('workout_sessions.started_at', dayStartISO(beforeKey))
  if (error) throw error
  return groupRowsIntoWorkouts((data ?? []) as unknown as ExerciseRow[])
}

/**
 * Catálogo completo para agrupar series por grupo muscular. Incluye ejercicios inactivos:
 * si faltaran, sus series históricas quedarían sin grupo (metrics.ts, `unassignedSets`).
 */
export async function fetchCatalog(): Promise<{ groups: CatalogMuscleGroup[]; exercises: CatalogExercise[] }> {
  const [groupsResult, exercisesResult] = await Promise.all([
    supabase.from('muscle_groups').select('id, name').order('name', { ascending: true }),
    supabase.from('exercises').select('id, name, muscle_group_id').order('name', { ascending: true }),
  ])
  if (groupsResult.error) throw groupsResult.error
  if (exercisesResult.error) throw exercisesResult.error
  return {
    groups: (groupsResult.data ?? []) as CatalogMuscleGroup[],
    exercises: (exercisesResult.data ?? []) as CatalogExercise[],
  }
}
