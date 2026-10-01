import { useEffect, useState } from 'react'
import { fetchCompletedDates } from '@/features/workouts/workoutApi'
import { computeStreak, type StreakResult } from '../streakUtils'

interface UseStreakResult {
  streak: StreakResult | null
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useStreak(): UseStreakResult {
  const [streak, setStreak] = useState<StreakResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCompletedDates()
      .then((dates) => {
        if (!cancelled) setStreak(computeStreak(dates))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo calcular la racha.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [tick])

  return { streak, loading, error, refresh: () => setTick((t) => t + 1) }
}
