import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type ExerciseWithGroup = Tables<'exercises'> & {
  muscle_groups: { name: string } | null
}

interface UseExercisesOptions {
  // Los administradores necesitan ver también los ejercicios desactivados.
  includeInactive?: boolean
}

interface ExercisesState {
  exercises: ExerciseWithGroup[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useExercises(options: UseExercisesOptions = {}): ExercisesState {
  const { includeInactive = false } = options
  const [exercises, setExercises] = useState<ExerciseWithGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExercises = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('exercises')
      .select('*, muscle_groups(name)')
      .order('name', { ascending: true })

    if (!includeInactive) {
      query = query.eq('active', true)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError('No se pudo cargar el catálogo de ejercicios.')
    } else {
      setExercises((data ?? []) as ExerciseWithGroup[])
    }
    setLoading(false)
  }, [includeInactive])

  useEffect(() => {
    fetchExercises()
  }, [fetchExercises])

  return { exercises, loading, error, refresh: fetchExercises }
}
