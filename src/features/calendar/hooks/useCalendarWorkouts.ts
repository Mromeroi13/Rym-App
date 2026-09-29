import { useCallback, useEffect, useState } from 'react'
import { fetchCalendarWorkouts } from '@/features/progress/progressApi'
import type { MetricWorkout } from '@/features/progress/metrics'

interface CalendarWorkoutsState {
  workouts: MetricWorkout[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// rangeStart / rangeEnd: 'YYYY-MM-DD' (ambos incluidos). Trae los entrenamientos
// completados que pueden cumplir alguna fecha visible (METRICS.md §7): started_at en el
// rango, o scheduled_date en el rango (un entrenamiento hecho tarde puede haber
// empezado fuera del mes visible).
export function useCalendarWorkouts(rangeStart: string, rangeEnd: string): CalendarWorkoutsState {
  const [workouts, setWorkouts] = useState<MetricWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setWorkouts(await fetchCalendarWorkouts(rangeStart, rangeEnd))
    } catch {
      setError('No se pudieron cargar los entrenamientos de este mes.')
    }
    setLoading(false)
  }, [rangeStart, rangeEnd])

  useEffect(() => {
    load()
  }, [load])

  return { workouts, loading, error, refresh: load }
}
