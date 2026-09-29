import { useCallback, useEffect, useState } from 'react'
import { fetchExerciseHistory } from '../progressApi'
import { exerciseProgression, type ProgressionPoint } from '../metrics'

interface ExerciseProgressionState {
  points: ProgressionPoint[]
  loading: boolean
  error: string | null
  refresh: () => void
}

/** Progresión de UN ejercicio (PROG-01): trae su historial y aplica metrics.ts. */
export function useExerciseProgression(exerciseId: string | null): ExerciseProgressionState {
  const [points, setPoints] = useState<ProgressionPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(() => {
    if (!exerciseId) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchExerciseHistory(exerciseId)
      .then((workouts) => {
        if (cancelled) return
        setPoints(exerciseProgression(workouts, exerciseId))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la progresión de este ejercicio.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [exerciseId])

  useEffect(() => load(), [load, tick])

  return { points, loading, error, refresh: () => setTick((t) => t + 1) }
}
