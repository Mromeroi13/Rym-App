import { useState, type FormEvent } from 'react'
import { ImageOff } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { TextField } from '@/components/TextField'
import { SelectField } from '@/components/SelectField'
import { supabase } from '@/lib/supabase'
import type { MuscleGroup } from '@/features/exercises/hooks/useMuscleGroups'
import type { ExerciseWithGroup } from '@/features/exercises/hooks/useExercises'
import { groupedExerciseGifAssets, suggestGifForExerciseName } from '@/features/exercises/exerciseGifAssets'

interface ExerciseFormDialogProps {
  muscleGroups: MuscleGroup[]
  exercise?: ExerciseWithGroup
  onClose: () => void
  onSaved: () => void
}

interface FieldErrors {
  name?: string
  muscleGroupId?: string
}

export function ExerciseFormDialog({
  muscleGroups,
  exercise,
  onClose,
  onSaved,
}: ExerciseFormDialogProps) {
  const isEditing = !!exercise
  const [name, setName] = useState(exercise?.name ?? '')
  const [muscleGroupId, setMuscleGroupId] = useState(exercise?.muscle_group_id ?? '')
  const [gifUrl, setGifUrl] = useState(exercise?.gif_url ?? '')
  // Solo autosugerimos al crear, y solo si el admin no ha tocado ya el selector a mano.
  const [gifTouched, setGifTouched] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const gifGroups = groupedExerciseGifAssets()

  function handleNameChange(value: string) {
    setName(value)
    if (!isEditing && !gifTouched) {
      const suggestion = suggestGifForExerciseName(value)
      setGifUrl(suggestion?.path ?? '')
    }
  }

  function handleGifChange(value: string) {
    setGifTouched(true)
    setGifUrl(value)
  }

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
    setSaveError(null)
    if (!validate()) return

    setSaving(true)
    const payload = { name: name.trim(), muscle_group_id: muscleGroupId, gif_url: gifUrl || null }

    const { error } = isEditing
      ? await supabase.from('exercises').update(payload).eq('id', exercise!.id)
      : await supabase.from('exercises').insert(payload)
    setSaving(false)

    if (error) {
      setSaveError('No se pudo guardar el ejercicio. Inténtalo de nuevo.')
      return
    }

    onSaved()
    onClose()
  }

  return (
    <Modal
      title={isEditing ? 'Editar Ejercicio' : 'Crear Nuevo Ejercicio Oficial'}
      description={
        isEditing
          ? 'Los cambios se aplican de inmediato para todos los usuarios.'
          : 'Se publicará directamente en la biblioteca oficial para todos los usuarios.'
      }
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <TextField
          id="exercise-name"
          label="Nombre del ejercicio"
          value={name}
          onChange={handleNameChange}
          placeholder="Ej: Fondos en paralelas lastrados"
          error={fieldErrors.name}
        />
        <SelectField
          id="exercise-muscle-group"
          label="Grupo muscular"
          value={muscleGroupId}
          onChange={setMuscleGroupId}
          options={muscleGroups.map((g) => ({ value: g.id, label: g.name }))}
          error={fieldErrors.muscleGroupId}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="exercise-gif" className="text-sm font-semibold text-textPrimary">
            GIF de demostración <span className="font-normal text-textSecondary">(opcional)</span>
          </label>
          <select
            id="exercise-gif"
            value={gifUrl}
            onChange={(e) => handleGifChange(e.target.value)}
            className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">Sin GIF</option>
            {gifGroups.map(({ folder, assets }) => (
              <optgroup key={folder} label={folder.replace(/_/g, ' ')}>
                {assets.map((asset) => (
                  <option key={asset.path} value={asset.path}>
                    {asset.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-xs text-textSecondary">
            Solo se listan los archivos que existen realmente en public/exercise-gifs.
          </p>
          <div className="mt-1 flex h-32 items-center justify-center overflow-hidden rounded-xl bg-background">
            {gifUrl ? (
              <img src={gifUrl} alt="Vista previa del GIF" className="max-h-full max-w-full object-contain" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs text-textSecondary">
                <ImageOff size={20} />
                Sin vista previa
              </span>
            )}
          </div>
        </div>

        {saveError && <p className="text-sm text-critical">{saveError}</p>}

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
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar en Biblioteca'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
