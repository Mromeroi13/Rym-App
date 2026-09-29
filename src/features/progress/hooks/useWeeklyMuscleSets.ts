import { useCallback, useEffect, useState } from 'react'
import { fetchCatalog, fetchCompletedWorkoutsByStart } from '../progressApi'
import { weekEndKey, weeklySetsByMuscleGroup, weekStartKey, type WeeklySets } from '../metrics'
import { addDaysKey } from '@/utils/dates'
import type { CatalogExercise, CatalogMuscleGroup } from '../metrics'

interface WeeklyMuscleSetsState {
  data: WeeklySets | null
  loading: boolean
  error: string | null
  refresh: () => void
}

/**
 * Series por grupo muscular de la semana que contiene `anchorDate` (PROG-06). Trae el
 * catálogo completo y los entrenamientos de esa semana y la anterior (metrics.ts hace
 * el resto).
 */
export function useWeeklyMuscleSets(anchorDate: string): WeeklyMuscleSetsState {
  const [data, setData] = useState<WeeklySets | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const start = weekStartKey(anchorDate)
    const end = weekEndKey(start)
    const previousStart = addDaysKey(start, -7)

    Promise.all([fetchCatalog(), fetchCompletedWorkoutsByStart(previousStart, end)])
      .then(([catalog, workouts]) => {
        if (cancelled) return
        setData(
          weeklySetsByMuscleGroup(
            workouts,
            catalog.exercises as CatalogExercise[],
            catalog.groups as CatalogMuscleGroup[],
            start,
          ),
        )
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar las series de esta semana.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [anchorDate])

  useEffect(() => load(), [load, tick])

  return { data, loading, error, refresh: () => setTick((t) => t + 1) }
}
