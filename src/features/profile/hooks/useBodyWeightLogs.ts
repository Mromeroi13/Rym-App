import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { fetchBodyWeightLogs, type BodyWeightLog } from '../bodyWeightApi'

interface UseBodyWeightLogsResult {
  logs: BodyWeightLog[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useBodyWeightLogs(): UseBodyWeightLogsResult {
  const { profile } = useAuth()
  const [logs, setLogs] = useState<BodyWeightLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(() => {
    if (!profile) return
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchBodyWeightLogs(profile.id)
      .then((data) => { if (!cancelled) setLogs(data) })
      .catch(() => { if (!cancelled) setError('No se pudo cargar el historial de peso.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [profile])

  useEffect(() => load(), [load, tick])

  return { logs, loading, error, refresh: () => setTick((t) => t + 1) }
}
