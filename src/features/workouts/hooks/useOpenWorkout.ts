import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { fetchOpenWorkout } from '../workoutApi'
import type { OpenWorkout } from '../workoutTypes'

export function useOpenWorkout() {
  const { profile } = useAuth()
  const [openWorkout, setOpenWorkout] = useState<OpenWorkout | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!profile) {
      setOpenWorkout(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setOpenWorkout(await fetchOpenWorkout(profile.id))
    } catch {
      setOpenWorkout(null)
    }
    setLoading(false)
  }, [profile])

  useEffect(() => {
    load()
  }, [load])

  return { openWorkout, loading, refresh: load }
}
