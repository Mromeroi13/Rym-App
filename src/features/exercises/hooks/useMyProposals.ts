import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type ProposalWithGroup = Tables<'exercise_proposals'> & {
  muscle_groups: { name: string } | null
}

interface MyProposalsState {
  proposals: ProposalWithGroup[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMyProposals(userId: string | undefined): MyProposalsState {
  const [proposals, setProposals] = useState<ProposalWithGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProposals = useCallback(async () => {
    if (!userId) {
      setProposals([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('exercise_proposals')
      .select('*, muscle_groups(name)')
      .eq('submitted_by', userId)
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('No se pudieron cargar tus solicitudes.')
    } else {
      setProposals((data ?? []) as ProposalWithGroup[])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return { proposals, loading, error, refresh: fetchProposals }
}
