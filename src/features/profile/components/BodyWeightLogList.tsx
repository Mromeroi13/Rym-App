import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useToast } from '@/components/toast'
import { deleteBodyWeightLog, type BodyWeightLog } from '../bodyWeightApi'

function formatDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

interface BodyWeightLogListProps {
  logs: BodyWeightLog[]
  onDeleted: () => void
}

export function BodyWeightLogList({ logs, onDeleted }: BodyWeightLogListProps) {
  const { show } = useToast()
  const [deleting, setDeleting] = useState<BodyWeightLog | null>(null)
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const sorted = [...logs].sort((a, b) => b.logged_date.localeCompare(a.logged_date))

  async function confirmDelete() {
    if (!deleting) return
    setBusy(true)
    setDeleteError(null)
    try {
      await deleteBodyWeightLog(deleting.id)
      show('Registro eliminado.', 'success')
      setDeleting(null)
      onDeleted()
    } catch {
      setDeleteError('No se pudo eliminar el registro. Inténtalo de nuevo.')
    }
    setBusy(false)
  }

  if (sorted.length === 0) return null

  return (
    <>
      <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
        {sorted.map((log, i) => {
          const prev = sorted[i + 1]
          const diff = prev ? Number(log.weight_kg) - Number(prev.weight_kg) : null
          return (
            <div key={log.id} className="flex items-center justify-between gap-3 bg-surface px-4 py-3">
              <div className="min-w-0">
                <p className="text-xs text-textSecondary capitalize">{formatDate(log.logged_date)}</p>
                {log.note && <p className="mt-0.5 truncate text-xs text-textSecondary">{log.note}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="text-right">
                  <p className="font-heading text-sm font-bold text-textPrimary">{Number(log.weight_kg).toFixed(1)} kg</p>
                  {diff !== null && (
                    <p className={`text-xs font-semibold ${diff < 0 ? 'text-success' : diff > 0 ? 'text-critical' : 'text-textSecondary'}`}>
                      {diff > 0 ? '+' : ''}{diff.toFixed(1)} kg
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setDeleteError(null); setDeleting(log) }}
                  className="rounded-lg p-1.5 text-textSecondary hover:bg-critical/10 hover:text-critical"
                  title="Eliminar registro"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {deleting && (
        <Modal
          title="Eliminar registro"
          description={`¿Seguro que quieres eliminar el registro del ${formatDate(deleting.logged_date)} (${Number(deleting.weight_kg).toFixed(1)} kg)?`}
          onClose={() => setDeleting(null)}
        >
          {deleteError && <p className="mb-3 text-sm text-critical">{deleteError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setDeleting(null)}
              className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60">
              Cancelar
            </button>
            <button type="button" onClick={confirmDelete} disabled={busy}
              className="rounded-xl bg-critical px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-critical/90 disabled:opacity-60">
              {busy ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </>
  )
}
