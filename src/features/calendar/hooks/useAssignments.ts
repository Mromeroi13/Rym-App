import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type AssignmentWithRoutine = Tables<'routine_assignments'> & {
  routines: { name: string } | null
}

interface AssignmentsState {
  assignments: AssignmentWithRoutine[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// rangeStart / rangeEnd: 'YYYY-MM-DD' (ambos incluidos)
export function useAssignments(rangeStart: string, rangeEnd: string): AssignmentsState {
  const [assignments, setAssignments] = useState<AssignmentWithRoutine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('routine_assignments')
      .select('*, routines(name)')
      .gte('scheduled_date', rangeStart)
      .lte('scheduled_date', rangeEnd)
      .order('scheduled_date', { ascending: true })

    if (fetchError) {
      setError('No se pudo cargar tu calendario.')
    } else {
      setAssignments((data ?? []) as unknown as AssignmentWithRoutine[])
    }
    setLoading(false)
  }, [rangeStart, rangeEnd])

  useEffect(() => {
    load()
  }, [load])

  return { assignments, loading, error, refresh: load }
}
