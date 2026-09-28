import { useEffect, useState, type FormEvent } from 'react'
import { Modal } from '@/components/Modal'
import { SelectField } from '@/components/SelectField'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatLongDate, todayKey } from '@/utils/dates'
import type { RoutineWithDetails } from '../types'

interface AssignRoutineDialogProps {
  routines: RoutineWithDetails[]
  // Si se indican, ese campo queda fijo (p. ej. desde el calendario la fecha ya está elegida).
  fixedRoutineId?: string
  fixedDate?: string
  onClose: () => void
  onAssigned: () => void
}

interface ExistingAssignment {
  routineId: string
  routineName: string
}

export function AssignRoutineDialog({
  routines,
  fixedRoutineId,
  fixedDate,
  onClose,
  onAssigned,
}: AssignRoutineDialogProps) {
  const { profile } = useAuth()
  const [routineId, setRoutineId] = useState(fixedRoutineId ?? '')
  const [date, setDate] = useState(fixedDate ?? todayKey())
  const [existing, setExisting] = useState<ExistingAssignment | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile || !date) {
      setExisting(null)
      return
    }
    let cancelled = false
    supabase
      .from('routine_assignments')
      .select('routine_id, routines(name)')
      .eq('user_id', profile.id)
      .eq('scheduled_date', date)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) {
          setExisting(null)
          return
        }
        const row = data as unknown as { routine_id: string; routines: { name: string } | null }
        setExisting({ routineId: row.routine_id, routineName: row.routines?.name ?? 'otra rutina' })
      })
    return () => {
      cancelled = true
    }
  }, [profile, date])

  const isSameRoutine = !!existing && existing.routineId === routineId
  const willReplace = !!existing && !isSameRoutine

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!profile) return
    if (!routineId) {
      setError('Selecciona una rutina.')
      return
    }
    if (!date) {
      setError('Selecciona una fecha.')
      return
    }

    setSaving(true)
    const { error: upsertError } = await supabase
      .from('routine_assignments')
      .upsert(
        { user_id: profile.id, routine_id: routineId, scheduled_date: date },
        { onConflict: 'user_id,scheduled_date' },
      )
    setSaving(false)

    if (upsertError) {
      setError('No se pudo asignar la rutina. Inténtalo de nuevo.')
      return
    }
    onAssigned()
    onClose()
  }

  return (
    <Modal
      title="Asignar rutina a una fecha"
      description="Cada fecha admite una sola rutina."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {fixedRoutineId ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-textPrimary">Rutina</span>
            <div className="flex h-12 items-center rounded bg-background px-3.5 text-sm font-medium text-textPrimary">
              {routines.find((r) => r.id === fixedRoutineId)?.name ?? '—'}
            </div>
          </div>
        ) : (
          <SelectField
            id="assign-routine"
            label="Rutina"
            value={routineId}
            onChange={setRoutineId}
            options={routines.map((r) => ({ value: r.id, label: r.name }))}
            placeholder="Selecciona una rutina"
          />
        )}

        {fixedDate ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-textPrimary">Fecha</span>
            <div className="flex h-12 items-center rounded bg-background px-3.5 text-sm font-medium capitalize text-textPrimary">
              {formatLongDate(fixedDate)}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <label htmlFor="assign-date" className="text-sm font-semibold text-textPrimary">
              Fecha
            </label>
            <input
              id="assign-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 w-full rounded border border-border bg-surface px-3.5 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        )}

        {willReplace && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
            Ese día ya tiene asignada «{existing?.routineName}». Si continúas, se reemplazará.
          </p>
        )}
        {isSameRoutine && (
          <p className="rounded-xl bg-background p-3 text-sm text-textSecondary">
            Esta rutina ya está asignada a esa fecha.
          </p>
        )}
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
            disabled={saving || isSameRoutine}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : willReplace ? 'Reemplazar' : 'Asignar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
