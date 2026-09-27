import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type MuscleGroup = Tables<'muscle_groups'>

interface MuscleGroupsState {
  groups: MuscleGroup[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMuscleGroups(): MuscleGroupsState {
  const [groups, setGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('muscle_groups')
      .select('*')
      .order('name', { ascending: true })

    if (fetchError) {
      setError('No se pudieron cargar los grupos musculares.')
    } else {
      setGroups(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return { groups, loading, error, refresh: fetchGroups }
}
