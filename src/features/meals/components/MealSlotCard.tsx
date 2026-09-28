import { useEffect, useState, type ComponentType, type FormEvent } from 'react'
import { Apple, Check, Cookie, Moon, Pencil, Plus, Sunrise, Trash2, UtensilsCrossed } from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import type { MealType } from '@/types/database.types'
import { Modal } from '@/components/Modal'
import { MAX_MEAL_DESCRIPTION, isLogged, validateMealDescription } from '../mealSlots'
import type { MealRow } from '../mealApi'

const ICONS: Record<MealType, ComponentType<LucideProps>> = {
  breakfast: Sunrise,
  snack: Apple,
  lunch: UtensilsCrossed,
  afternoon_snack: Cookie,
  dinner: Moon,
}

interface MealSlotCardProps {
  position: number
  type: MealType
  label: string
  meal: MealRow | null
  // Devuelven un mensaje de error, o null si todo fue bien.
  onSave: (description: string) => Promise<string | null>
  onDelete: () => Promise<string | null>
  // Callback estable del padre: avisa de si este tramo tiene texto sin guardar.
  onDirtyChange: (type: MealType, dirty: boolean) => void
}

export function MealSlotCard({ position, type, label, meal, onSave, onDelete, onDirtyChange }: MealSlotCardProps) {
  const Icon = ICONS[type]
  const logged = isLogged(meal)

  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const original = (meal?.description ?? '').trim()
  const dirty = editing && text.trim() !== original

  useEffect(() => {
    onDirtyChange(type, dirty)
  }, [type, dirty, onDirtyChange])
  useEffect(() => () => onDirtyChange(type, false), [type, onDirtyChange])

  function startEdit() {
    setText(meal?.description ?? '')
    setFieldError(null)
    setSaveError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setFieldError(null)
    setSaveError(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaveError(null)
    const validation = validateMealDescription(text)
    setFieldError(validation)
    if (validation) return

    setSaving(true)
    const error = await onSave(text)
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setEditing(false)
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError(null)
    const error = await onDelete()
    setDeleting(false)
    if (error) {
      setDeleteError(error)
      return
    }
    setConfirmingDelete(false)
  }

  const remaining = MAX_MEAL_DESCRIPTION - text.trim().length

  return (
    <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              logged ? 'bg-success/10 text-success' : 'bg-background text-textSecondary'
            }`}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Comida {position}</p>
            <h3 className="truncate font-heading text-base font-bold text-textPrimary">{label}</h3>
          </div>
        </div>

        {logged ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
            <Check size={12} /> Registrado
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-background px-2.5 py-1 text-xs font-semibold text-textSecondary">
            Pendiente
          </span>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor={`meal-${type}`} className="sr-only">
              Descripción de {label}
            </label>
            <textarea
              id={`meal-${type}`}
              rows={3}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ej: Bowl de avena con plátano y crema de cacahuete"
              className={`w-full rounded-xl border bg-surface p-3 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                fieldError ? 'border-critical' : 'border-border'
              }`}
            />
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs text-critical">{fieldError}</p>
              <span className={`shrink-0 text-xs ${remaining < 0 ? 'text-critical' : 'text-textSecondary'}`}>
                {remaining}
              </span>
            </div>
          </div>

          {saveError && <p className="text-sm text-critical">{saveError}</p>}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="h-11 rounded-xl bg-background px-4 text-sm font-medium text-textSecondary hover:bg-border/60 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {saving ? 'Guardando...' : `Guardar ${label}`}
            </button>
          </div>
        </form>
      ) : logged ? (
        <>
          <p className="mt-4 whitespace-pre-line break-words text-sm text-textPrimary">{meal?.description}</p>
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-background px-3.5 text-sm font-semibold text-textPrimary hover:bg-border/60"
            >
              <Pencil size={14} /> Editar
            </button>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null)
                setConfirmingDelete(true)
              }}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-background px-3.5 text-sm font-semibold text-textSecondary hover:bg-critical/10 hover:text-critical"
            >
              <Trash2 size={14} /> Borrar
            </button>
          </div>
        </>
      ) : (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-textSecondary">Aún no has registrado esta comida.</p>
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <Plus size={16} /> Añadir {label}
          </button>
        </div>
      )}

      {confirmingDelete && (
        <Modal
          title={`Borrar ${label}`}
          description="Se eliminará el registro de esta comida. Podrás volver a añadirla cuando quieras."
          onClose={() => setConfirmingDelete(false)}
        >
          {deleteError && <p className="mb-3 text-sm text-critical">{deleteError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              disabled={deleting}
              className="h-11 rounded-xl bg-background px-4 text-sm font-medium text-textSecondary hover:bg-border/60 disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="h-11 rounded-xl bg-critical px-5 text-sm font-semibold text-white shadow-sm hover:bg-critical/90 disabled:opacity-60"
            >
              {deleting ? 'Borrando...' : 'Borrar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
