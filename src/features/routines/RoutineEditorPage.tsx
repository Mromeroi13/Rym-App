import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowLeft, ArrowUp, Film, Plus, Trash2, TrendingUp } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import type { ExerciseWithGroup } from '@/features/exercises/hooks/useExercises'
import { fetchRoutine, saveRoutine } from './routineApi'
import { ExercisePickerDialog } from './components/ExercisePickerDialog'
import { ExerciseProgressionDialog } from '@/features/progress/components/ExerciseProgressionDialog'
import { ExerciseGifModal } from '@/features/exercises/components/ExerciseGifModal'
import { validateDraft, hasErrors, type DraftErrors } from './validation'
import { draftFromRoutine, emptyDraft, emptySet, newKey } from './utils'
import type { RoutineDraft, RoutineExerciseDraft, RoutineSetDraft } from './types'

type LoadState = 'loading' | 'ready' | 'notfound' | 'error'

const NO_ERRORS: DraftErrors = { exerciseSets: {}, sets: {} }

export function RoutineEditorPage() {
  const { routineId } = useParams()
  const isEditing = !!routineId
  const navigate = useNavigate()
  const { profile } = useAuth()

  const [draft, setDraft] = useState<RoutineDraft>(emptyDraft)
  const [initialSnapshot, setInitialSnapshot] = useState(() => JSON.stringify(emptyDraft()))
  const [loadState, setLoadState] = useState<LoadState>(isEditing ? 'loading' : 'ready')
  const [errors, setErrors] = useState<DraftErrors>(NO_ERRORS)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string } | null>(null)
  // Independiente de todo lo demás: abrir/cerrar este modal no debe tocar el borrador de la rutina.
  const [gifExercise, setGifExercise] = useState<{ name: string; gifUrl: string | null } | null>(null)

  useEffect(() => {
    if (!routineId) return
    let cancelled = false
    setLoadState('loading')
    fetchRoutine(routineId)
      .then((routine) => {
        if (cancelled) return
        if (!routine) {
          setLoadState('notfound')
          return
        }
        const loaded = draftFromRoutine(routine)
        setDraft(loaded)
        setInitialSnapshot(JSON.stringify(loaded))
        setLoadState('ready')
      })
      .catch(() => {
        if (!cancelled) setLoadState('error')
      })
    return () => {
      cancelled = true
    }
  }, [routineId])

  const isDirty = JSON.stringify(draft) !== initialSnapshot

  function updateExercise(key: string, change: (exercise: RoutineExerciseDraft) => RoutineExerciseDraft) {
    setDraft((d) => ({ ...d, exercises: d.exercises.map((ex) => (ex.key === key ? change(ex) : ex)) }))
  }

  function addExercise(exercise: ExerciseWithGroup) {
    setDraft((d) => ({
      ...d,
      exercises: [
        ...d.exercises,
        {
          key: newKey(),
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscleGroupName: exercise.muscle_groups?.name ?? null,
          gifUrl: exercise.gif_url ?? null,
          sets: [emptySet()],
        },
      ],
    }))
  }

  function removeExercise(key: string) {
    setDraft((d) => ({ ...d, exercises: d.exercises.filter((ex) => ex.key !== key) }))
  }

  function moveExercise(index: number, direction: -1 | 1) {
    setDraft((d) => {
      const target = index + direction
      if (target < 0 || target >= d.exercises.length) return d
      const exercises = [...d.exercises]
      ;[exercises[index], exercises[target]] = [exercises[target], exercises[index]]
      return { ...d, exercises }
    })
  }

  function addSet(exerciseKey: string) {
    updateExercise(exerciseKey, (ex) => {
      const last = ex.sets[ex.sets.length - 1]
      // Comodidad: la nueva serie parte de los valores de la anterior (luego es independiente).
      const next: RoutineSetDraft = last
        ? { key: newKey(), plannedWeight: last.plannedWeight, plannedReps: last.plannedReps }
        : emptySet()
      return { ...ex, sets: [...ex.sets, next] }
    })
  }

  function removeSet(exerciseKey: string, setKey: string) {
    updateExercise(exerciseKey, (ex) => ({ ...ex, sets: ex.sets.filter((s) => s.key !== setKey) }))
  }

  function updateSet(exerciseKey: string, setKey: string, patch: Partial<RoutineSetDraft>) {
    updateExercise(exerciseKey, (ex) => ({
      ...ex,
      sets: ex.sets.map((s) => (s.key === setKey ? { ...s, ...patch } : s)),
    }))
  }

  function handleCancel() {
    if (isDirty && !window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres salir?')) return
    navigate('/rutinas')
  }

  async function handleSave() {
    setSaveError(null)
    const validation = validateDraft(draft)
    setErrors(validation)
    if (hasErrors(validation) || !profile) return

    setSaving(true)
    try {
      await saveRoutine(profile.id, routineId ?? null, draft)
      navigate('/rutinas')
    } catch {
      setSaveError('No se pudo guardar la rutina. Inténtalo de nuevo.')
      setSaving(false)
    }
  }

  if (loadState === 'loading') {
    return <p className="text-sm text-textSecondary">Cargando rutina...</p>
  }
  if (loadState === 'notfound' || loadState === 'error') {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <p className="text-sm text-textPrimary">
          {loadState === 'notfound' ? 'No se encontró esta rutina.' : 'No se pudo cargar la rutina.'}
        </p>
        <Link to="/rutinas" className="mt-3 inline-block text-sm font-semibold text-primary">
          Volver a Rutinas
        </Link>
      </div>
    )
  }

  const inputClasses = (invalid: boolean) =>
    `h-11 w-full rounded-xl border bg-surface px-3 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
      invalid ? 'border-critical' : 'border-border'
    }`

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-textSecondary hover:text-textPrimary"
        >
          <ArrowLeft size={16} /> Volver a Rutinas
        </button>
        <h1 className="mt-2 font-heading text-2xl font-bold text-textPrimary">
          {isEditing ? 'Editar rutina' : 'Nueva rutina'}
        </h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="routine-name" className="text-sm font-semibold text-textPrimary">
              Nombre
            </label>
            <input
              id="routine-name"
              type="text"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="Ej: Torso Hipertrofia A"
              className={inputClasses(!!errors.name)}
            />
            {errors.name && <p className="text-xs text-critical">{errors.name}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="routine-description" className="text-sm font-semibold text-textPrimary">
              Descripción <span className="font-normal text-textSecondary">(opcional)</span>
            </label>
            <textarea
              id="routine-description"
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-textPrimary">Ejercicios</h2>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-textPrimary hover:bg-border/60"
          >
            <Plus size={16} /> Añadir ejercicio
          </button>
        </div>
        {errors.exercises && <p className="text-sm text-critical">{errors.exercises}</p>}

        {draft.exercises.length === 0 && (
          <p className="rounded-xl border border-dashed border-border bg-surface p-6 text-center text-sm text-textSecondary">
            Todavía no has añadido ejercicios.
          </p>
        )}

        {draft.exercises.map((exercise, index) => (
          <div key={exercise.key} className="rounded-xl border border-border bg-surface p-4 md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-textPrimary">
                  {index + 1}. {exercise.exerciseName}
                </p>
                <p className="text-xs text-textSecondary">{exercise.muscleGroupName ?? 'Sin grupo'}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setGifExercise({ name: exercise.exerciseName, gifUrl: exercise.gifUrl })}
                  title="Ver cómo se realiza"
                  className="rounded-lg p-2 text-textSecondary hover:bg-background"
                >
                  <Film size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setProgressionExercise({ id: exercise.exerciseId, name: exercise.exerciseName })}
                  title="Ver progresión de peso"
                  className="rounded-lg p-2 text-textSecondary hover:bg-background"
                >
                  <TrendingUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveExercise(index, -1)}
                  disabled={index === 0}
                  title="Subir"
                  className="rounded-lg p-2 text-textSecondary hover:bg-background disabled:opacity-30"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => moveExercise(index, 1)}
                  disabled={index === draft.exercises.length - 1}
                  title="Bajar"
                  className="rounded-lg p-2 text-textSecondary hover:bg-background disabled:opacity-30"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeExercise(exercise.key)}
                  title="Quitar ejercicio"
                  className="rounded-lg p-2 text-textSecondary hover:bg-critical/10 hover:text-critical"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 px-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                <span>Serie</span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span />
              </div>
              {exercise.sets.map((set, setIndex) => {
                const setErrors = errors.sets[set.key]
                return (
                  <div key={set.key}>
                    <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2">
                      <span className="pl-1 text-sm font-semibold text-textSecondary">{setIndex + 1}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        value={set.plannedWeight}
                        onChange={(e) => updateSet(exercise.key, set.key, { plannedWeight: e.target.value })}
                        placeholder="—"
                        aria-label={`Peso serie ${setIndex + 1}`}
                        className={inputClasses(!!setErrors?.weight)}
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        step="1"
                        min="1"
                        value={set.plannedReps}
                        onChange={(e) => updateSet(exercise.key, set.key, { plannedReps: e.target.value })}
                        placeholder="—"
                        aria-label={`Repeticiones serie ${setIndex + 1}`}
                        className={inputClasses(!!setErrors?.reps)}
                      />
                      <button
                        type="button"
                        onClick={() => removeSet(exercise.key, set.key)}
                        title="Quitar serie"
                        className="flex h-11 items-center justify-center rounded-lg text-textSecondary hover:bg-critical/10 hover:text-critical"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {(setErrors?.weight || setErrors?.reps) && (
                      <p className="mt-1 pl-10 text-xs text-critical">
                        {[setErrors.weight, setErrors.reps].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                )
              })}
              {errors.exerciseSets[exercise.key] && (
                <p className="text-xs text-critical">{errors.exerciseSets[exercise.key]}</p>
              )}
              <button
                type="button"
                onClick={() => addSet(exercise.key)}
                className="mt-1 inline-flex items-center gap-1.5 self-start rounded-lg px-2 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10"
              >
                <Plus size={14} /> Añadir serie
              </button>
            </div>
          </div>
        ))}
      </div>

      {saveError && (
        <div className="rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pb-4">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear rutina'}
        </button>
      </div>

      {showPicker && <ExercisePickerDialog onPick={addExercise} onClose={() => setShowPicker(false)} />}

      {progressionExercise && (
        <ExerciseProgressionDialog
          exerciseId={progressionExercise.id}
          exerciseName={progressionExercise.name}
          onClose={() => setProgressionExercise(null)}
        />
      )}

      {gifExercise && (
        <ExerciseGifModal
          exerciseName={gifExercise.name}
          gifUrl={gifExercise.gifUrl}
          onClose={() => setGifExercise(null)}
        />
      )}
    </div>
  )
}
