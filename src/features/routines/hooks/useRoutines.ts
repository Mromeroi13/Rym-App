import { useCallback, useEffect, useState } from 'react'
import { fetchRoutines } from '../routineApi'
import type { RoutineWithDetails } from '../types'

interface RoutinesState {
  routines: RoutineWithDetails[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRoutines(): RoutinesState {
  const [routines, setRoutines] = useState<RoutineWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRoutines(await fetchRoutines())
    } catch {
      setError('No se pudieron cargar tus rutinas.')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { routines, loading, error, refresh: load }
}
