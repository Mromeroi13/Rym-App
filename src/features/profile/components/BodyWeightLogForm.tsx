import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/components/toast'
import { upsertBodyWeightLog } from '../bodyWeightApi'
import { todayKey } from '@/utils/dates'

interface BodyWeightLogFormProps {
  onSaved: () => void
}

export function BodyWeightLogForm({ onSaved }: BodyWeightLogFormProps) {
  const { profile } = useAuth()
  const { show } = useToast()
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(todayKey())
  const [weight, setWeight] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFieldError(null)
    setError(null)

    const kg = parseFloat(weight.replace(',', '.'))
    if (isNaN(kg) || kg <= 0 || kg > 400) {
      setFieldError('Introduce un peso válido entre 0 y 400 kg.')
      return
    }
    if (!date) {
      setFieldError('Selecciona una fecha.')
      return
    }

    setSaving(true)
    try {
      await upsertBodyWeightLog(profile!.id, date, kg, note.trim() || undefined)
      show('Peso registrado.', 'success')
      setWeight('')
      setNote('')
      setDate(todayKey())
      setOpen(false)
      onSaved()
    } catch {
      setError('No se pudo guardar el registro. Inténtalo de nuevo.')
    }
    setSaving(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
      >
        <Plus size={16} />
        Añadir registro
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-primary/30 bg-primary/5 p-4 flex flex-col gap-3" noValidate>
      <p className="text-sm font-semibold text-textPrimary">Nuevo registro de peso</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textSecondary">Fecha</label>
          <input
            type="date"
            value={date}
            max={todayKey()}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-textSecondary">Peso (kg)</label>
          <div className="relative flex items-center">
            <input
              type="number"
              step="0.1"
              min="1"
              max="400"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="78.4"
              autoFocus
              className={`h-10 w-full rounded-xl border bg-surface px-3 pr-10 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${fieldError ? 'border-critical' : 'border-border'}`}
            />
            <span className="absolute right-3 text-xs font-semibold text-textSecondary">kg</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-textSecondary">Nota (opcional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: después de entrenar, en ayunas..."
          maxLength={120}
          className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {(fieldError || error) && (
        <p className="text-xs text-critical">{fieldError ?? error}</p>
      )}

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={() => { setOpen(false); setFieldError(null); setError(null) }}
          className="rounded-xl bg-background px-4 py-2 text-sm font-medium text-textSecondary hover:bg-border/60">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60">
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
