import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/Modal'
import { TextField } from '@/components/TextField'
import { SelectField } from '@/components/SelectField'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'
import type { MuscleGroup } from '../hooks/useMuscleGroups'

interface ProposeExerciseDialogProps {
  muscleGroups: MuscleGroup[]
  onClose: () => void
  onProposed: () => void
}

interface FieldErrors {
  name?: string
  muscleGroupId?: string
}

export function ProposeExerciseDialog({
  muscleGroups,
  onClose,
  onProposed,
}: ProposeExerciseDialogProps) {
  const { profile } = useAuth()
  const [name, setName] = useState('')
  const [muscleGroupId, setMuscleGroupId] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (name.trim().length < 3) {
      errors.name = 'El nombre debe tener al menos 3 caracteres'
    }
    if (!muscleGroupId) {
      errors.muscleGroupId = 'Selecciona un grupo muscular'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!validate() || !profile) return

    setSubmitting(true)
    const { error } = await supabase.from('exercise_proposals').insert({
      submitted_by: profile.id,
      name: name.trim(),
      muscle_group_id: muscleGroupId,
    })
    setSubmitting(false)

    if (error) {
      setSubmitError('No se pudo enviar tu solicitud. Inténtalo de nuevo.')
      return
    }

    onProposed()
    onClose()
  }

  return (
    <Modal
      title="Solicitar Ejercicio"
      description="Propón un ejercicio que no está en el catálogo oficial. Un administrador la revisará."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          id="proposal-name"
          label="Nombre del ejercicio"
          value={name}
          onChange={setName}
          placeholder="Ej: Press Arnold con mancuernas"
          error={fieldErrors.name}
        />
        <SelectField
          id="proposal-muscle-group"
          label="Grupo muscular"
          value={muscleGroupId}
          onChange={setMuscleGroupId}
          options={muscleGroups.map((g) => ({ value: g.id, label: g.name }))}
          error={fieldErrors.muscleGroupId}
        />

        {submitError && <p className="text-sm text-critical">{submitError}</p>}

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
            disabled={submitting}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
