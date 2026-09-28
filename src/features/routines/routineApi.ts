import { supabase } from '@/lib/supabase'
import type { RoutineDraft, RoutineWithDetails } from './types'

const ROUTINE_SELECT =
  '*, routine_exercises(id, exercise_id, position, exercises(name, muscle_groups(name)), routine_sets(id, routine_exercise_id, set_number, planned_weight_kg, planned_reps))'

function normalize(routine: RoutineWithDetails): RoutineWithDetails {
  return {
    ...routine,
    routine_exercises: [...routine.routine_exercises]
      .sort((a, b) => a.position - b.position)
      .map((re) => ({
        ...re,
        routine_sets: [...re.routine_sets].sort((a, b) => a.set_number - b.set_number),
      })),
  }
}

function toNullableNumber(value: string): number | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : Number(trimmed)
}

export async function fetchRoutines(): Promise<RoutineWithDetails[]> {
  const { data, error } = await supabase
    .from('routines')
    .select(ROUTINE_SELECT)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as RoutineWithDetails[]).map(normalize)
}

export async function fetchRoutine(id: string): Promise<RoutineWithDetails | null> {
  const { data, error } = await supabase
    .from('routines')
    .select(ROUTINE_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? normalize(data as unknown as RoutineWithDetails) : null
}

/**
 * Crea o actualiza una rutina completa (ejercicios y series incluidos).
 * Al editar, primero inserta los ejercicios/series nuevos y solo después borra los
 * anteriores, para no dejar la rutina vacía si algo falla a mitad del guardado.
 */
export async function saveRoutine(
  userId: string,
  routineId: string | null,
  draft: RoutineDraft,
): Promise<string> {
  const name = draft.name.trim()
  const description = draft.description.trim() || null
  const isNew = routineId === null

  let targetId: string
  let oldExerciseIds: string[] = []

  if (isNew) {
    const { data, error } = await supabase
      .from('routines')
      .insert({ user_id: userId, name, description })
      .select('id')
      .single()
    if (error) throw error
    targetId = data.id
  } else {
    targetId = routineId
    const { error } = await supabase
      .from('routines')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', targetId)
    if (error) throw error

    const { data, error: oldError } = await supabase
      .from('routine_exercises')
      .select('id')
      .eq('routine_id', targetId)
    if (oldError) throw oldError
    oldExerciseIds = (data ?? []).map((row) => row.id)
  }

  let newExerciseIds: string[] = []
  try {
    if (draft.exercises.length > 0) {
      const { data, error } = await supabase
        .from('routine_exercises')
        .insert(
          draft.exercises.map((exercise, index) => ({
            routine_id: targetId,
            exercise_id: exercise.exerciseId,
            position: index,
          })),
        )
        .select('id, position')
      if (error) throw error

      const inserted = data ?? []
      newExerciseIds = inserted.map((row) => row.id)
      const idByPosition = new Map(inserted.map((row) => [row.position, row.id]))

      const setRows = draft.exercises.flatMap((exercise, index) => {
        const routineExerciseId = idByPosition.get(index)
        if (!routineExerciseId) throw new Error('No se pudo enlazar un ejercicio de la rutina')
        return exercise.sets.map((set, setIndex) => ({
          routine_exercise_id: routineExerciseId,
          set_number: setIndex + 1,
          planned_weight_kg: toNullableNumber(set.plannedWeight),
          planned_reps: toNullableNumber(set.plannedReps),
        }))
      })

      if (setRows.length > 0) {
        const { error: setsError } = await supabase.from('routine_sets').insert(setRows)
        if (setsError) throw setsError
      }
    }

    if (oldExerciseIds.length > 0) {
      const { error } = await supabase.from('routine_exercises').delete().in('id', oldExerciseIds)
      if (error) throw error
    }
  } catch (err) {
    // Reversión best-effort: deja los datos como estaban antes del intento.
    if (isNew) {
      await supabase.from('routines').delete().eq('id', targetId)
    } else if (newExerciseIds.length > 0) {
      await supabase.from('routine_exercises').delete().in('id', newExerciseIds)
    }
    throw err
  }

  return targetId
}

export async function deleteRoutine(id: string): Promise<void> {
  // Las asignaciones de calendario se eliminan en cascada; el historial de
  // entrenamientos se conserva (source_routine_id pasa a null).
  const { error } = await supabase.from('routines').delete().eq('id', id)
  if (error) throw error
}
