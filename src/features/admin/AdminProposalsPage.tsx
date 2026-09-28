import { useMemo, useState } from 'react'
import { Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProposalStatusBadge } from '@/features/exercises/components/ProposalStatusBadge'
import type { ProposalStatus } from '@/types/database.types'
import { useProposalsAdmin, type ProposalForReview } from './hooks/useProposalsAdmin'
import { RejectProposalDialog } from './components/RejectProposalDialog'

const TABS: { value: ProposalStatus; label: string }[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptadas' },
  { value: 'rejected', label: 'Rechazadas' },
]

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function AdminProposalsPage() {
  const { proposals, loading, error, refresh } = useProposalsAdmin()
  const [statusFilter, setStatusFilter] = useState<ProposalStatus>('pending')
  const [rejecting, setRejecting] = useState<ProposalForReview | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(
    () => proposals.filter((p) => p.status === statusFilter),
    [proposals, statusFilter],
  )
  const pendingCount = useMemo(() => proposals.filter((p) => p.status === 'pending').length, [proposals])

  // Publica el ejercicio y marca la solicitud como aceptada en una sola transacción (RPC).
  async function acceptProposal(proposal: ProposalForReview) {
    setActionError(null)
    setAcceptingId(proposal.id)

    const { error: rpcError } = await supabase.rpc('accept_exercise_proposal', {
      p_proposal_id: proposal.id,
    })
    setAcceptingId(null)

    if (rpcError) {
      const alreadyReviewed = rpcError.message.includes('ya fue revisada')
      setActionError(
        alreadyReviewed
          ? 'Esta solicitud ya fue revisada por otro administrador.'
          : 'No se pudo aceptar la solicitud. Inténtalo de nuevo.',
      )
      if (alreadyReviewed) refresh()
      return
    }

    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Solicitudes</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Revisa los ejercicios propuestos por la comunidad y decide si se publican.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={tabClasses(statusFilter === tab.value)}
            >
              {tab.label}
              {tab.value === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
            </button>
          ))}
        </div>

        {actionError && <p className="mt-4 text-sm text-critical">{actionError}</p>}

        <div className="mt-5">
          {loading && <p className="text-sm text-textSecondary">Cargando solicitudes...</p>}
          {error && <p className="text-sm text-critical">{error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">
              No hay solicitudes en este estado.
            </p>
          )}
          {!loading && !error && filtered.length > 0 && (
            <div className="flex flex-col gap-3">
              {filtered.map((proposal) => (
                <div key={proposal.id} className="rounded-xl border border-border bg-background p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-textSecondary">
                          {proposal.muscle_groups?.name ?? 'Sin grupo'}
                        </span>
                        <span className="text-xs text-textSecondary">{formatDate(proposal.created_at)}</span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-textPrimary">{proposal.name}</p>
                      <p className="mt-0.5 text-xs text-textSecondary">
                        {proposal.submitter?.username ?? 'Usuario'}
                      </p>
                      {proposal.status === 'rejected' && proposal.rejection_reason && (
                        <p className="mt-2 text-xs text-critical">Motivo: {proposal.rejection_reason}</p>
                      )}
                    </div>

                    {proposal.status === 'pending' ? (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => acceptProposal(proposal)}
                          disabled={acceptingId === proposal.id}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                        >
                          <Check size={14} />
                          {acceptingId === proposal.id ? 'Publicando...' : 'Aceptar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejecting(proposal)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-surface px-3 py-2 text-xs font-semibold text-critical hover:bg-critical/10"
                        >
                          <X size={14} />
                          Rechazar
                        </button>
                      </div>
                    ) : (
                      <ProposalStatusBadge status={proposal.status} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {rejecting && (
        <RejectProposalDialog
          proposal={rejecting}
          onClose={() => setRejecting(null)}
          onReviewed={refresh}
        />
      )}
    </div>
  )
}
