import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Tables } from '@/types/database.types'

export type ProposalForReview = Tables<'exercise_proposals'> & {
  muscle_groups: { name: string } | null
  submitter: { username: string | null } | null
}

interface UseProposalsAdminState {
  proposals: ProposalForReview[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useProposalsAdmin(): UseProposalsAdminState {
  const [proposals, setProposals] = useState<ProposalForReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('exercise_proposals')
      .select(
        '*, muscle_groups(name), submitter:profiles!exercise_proposals_submitted_by_fkey(username)',
      )
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError('No se pudieron cargar las solicitudes.')
    } else {
      setProposals((data ?? []) as unknown as ProposalForReview[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchProposals()
  }, [fetchProposals])

  return { proposals, loading, error, refresh: fetchProposals }
}
