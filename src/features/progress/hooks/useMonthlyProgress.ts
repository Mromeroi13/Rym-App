import { useCallback, useEffect, useState } from 'react'
import { fetchCompletedWorkoutsByStart, fetchWorkoutsBefore } from '../progressApi'
import {
  increasedWeightExercises,
  monthRangeKeys,
  summarizeWorkouts,
  type IncreasedWeightExercise,
  type PeriodTotals,
} from '../metrics'

export interface MonthlyProgress {
  totals: PeriodTotals
  increasedWeight: IncreasedWeightExercise[]
}

interface MonthlyProgressState {
  data: MonthlyProgress | null
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Resumen del mes en curso para Home (HOME-04/05): entrenamientos, series, volumen y los
 * ejercicios que subieron de peso. Necesita, además del mes, el último entrenamiento
 * previo de cada ejercicio tocado, como referencia (METRICS.md §5).
 */
export function useMonthlyProgress(): MonthlyProgressState {
  const [data, setData] = useState<MonthlyProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const { start, end } = monthRangeKeys(year, month)

    fetchCompletedWorkoutsByStart(start, end)
      .then(async (monthWorkouts) => {
        if (cancelled) return
        const totals = summarizeWorkouts(monthWorkouts)
        const exerciseIds = [...new Set(monthWorkouts.flatMap((w) => w.workout_exercises.map((e) => e.exercise_id)))]
        const before = await fetchWorkoutsBefore(exerciseIds, start)
        if (cancelled) return
        setData({
          totals,
          increasedWeight: increasedWeightExercises([...before, ...monthWorkouts], year, month),
        })
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar tu progreso de este mes.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => load(), [load, tick])

  return { data, loading, error, refresh: () => setTick((t) => t + 1) }
}
