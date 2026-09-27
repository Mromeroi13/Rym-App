import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/Modal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import type { ProposalForReview } from '../hooks/useProposalsAdmin'

interface RejectProposalDialogProps {
  proposal: ProposalForReview
  onClose: () => void
  onReviewed: () => void
}

export function RejectProposalDialog({ proposal, onClose, onReviewed }: RejectProposalDialogProps) {
  const { profile } = useAuth()
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (reason.trim().length < 3) {
      setError('Indica un motivo de al menos 3 caracteres.')
      return
    }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('exercise_proposals')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', proposal.id)
    setSaving(false)

    if (updateError) {
      setError('No se pudo rechazar la solicitud. Inténtalo de nuevo.')
      return
    }

    onReviewed()
    onClose()
  }

  return (
    <Modal
      title="Rechazar solicitud"
      description={`Explica a ${proposal.submitter?.username ?? 'el usuario'} por qué "${proposal.name}" no se publicará.`}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <label htmlFor="rejection-reason" className="text-sm font-semibold text-textPrimary">
            Motivo del rechazo
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ej: Ya existe un ejercicio equivalente en el catálogo."
            className="w-full rounded border border-border bg-surface p-3 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {error && <p className="text-sm text-critical">{error}</p>}

        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-critical px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-critical/90 disabled:opacity-60"
          >
            {saving ? 'Rechazando...' : 'Rechazar solicitud'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
