import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ChevronRight, Flag, Pause, Play, Timer, TrendingUp, Undo2, X } from 'lucide-react'
import type { WorkoutSetRow, WorkoutWithDetails } from '../workoutTypes'
import { useStopwatch } from '../hooks/useStopwatch'
import { formatDuration } from '../timer'
import {
  baseInput,
  formatSetValues,
  parseSetInput,
  type SetInput,
} from '../workoutUtils'
import { clearSetCompletion, saveSetResult, updateWorkoutSession } from '../workoutApi'
import { NumberStepper } from './NumberStepper'
import { ExitWorkoutDialog, FinishWorkoutDialog } from './WorkoutDialogs'
import { ExerciseProgressionDialog } from '@/features/progress/components/ExerciseProgressionDialog'

interface WorkoutRunnerProps {
  workout: WorkoutWithDetails
  onFinished: () => void
}

type Dialog = 'exit' | 'finish' | null

export function WorkoutRunner({ workout, onFinished }: WorkoutRunnerProps) {
  const navigate = useNavigate()
  const exercises = workout.workout_exercises
  const timerEnabled = workout.timer_enabled

  const [sets, setSets] = useState<Record<string, WorkoutSetRow>>(() =>
    Object.fromEntries(exercises.flatMap((e) => e.workout_sets).map((s) => [s.id, s])),
  )
  const [inputs, setInputs] = useState<Record<string, SetInput>>(() =>
    Object.fromEntries(exercises.flatMap((e) => e.workout_sets).map((s) => [s.id, baseInput(s)])),
  )

  const firstPendingIndex = exercises.findIndex((e) => e.workout_sets.some((s) => !s.completed_at))
  const [exIndex, setExIndex] = useState(firstPendingIndex === -1 ? 0 : firstPendingIndex)
  const [selectedSetId, setSelectedSetId] = useState<string | null>(() => {
    const ex = exercises[firstPendingIndex === -1 ? 0 : firstPendingIndex]
    return (ex?.workout_sets.find((s) => !s.completed_at) ?? ex?.workout_sets[0])?.id ?? null
  })

  const [paused, setPaused] = useState(timerEnabled && workout.status === 'paused')
  const watch = useStopwatch(workout.elapsed_seconds, timerEnabled && workout.status === 'active')

  const [savingSetId, setSavingSetId] = useState<string | null>(null)
  const [inputError, setInputError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [dialogBusy, setDialogBusy] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  // Diálogo de progresión: independiente de exit/finish y del cronómetro (WK-06, PROG-04).
  const [showProgression, setShowProgression] = useState(false)

  const currentExercise = exercises[exIndex]
  const currentSets = currentExercise?.workout_sets.map((s) => sets[s.id]) ?? []
  const selectedSet = selectedSetId ? sets[selectedSetId] : undefined
  const selectedInput = selectedSetId ? inputs[selectedSetId] : undefined

  const totals = useMemo(() => {
    const all = Object.values<WorkoutSetRow>(sets)
    const done = all.filter((s) => s.completed_at).length
    return { total: all.length, done, pending: all.length - done }
  }, [sets])

  // ¿Hay valores escritos que aún no están guardados en la base de datos?
  const hasUnsavedInput = Object.values<WorkoutSetRow>(sets).some((s) => {
    const base = baseInput(s)
    const current = inputs[s.id]
    return !!current && (current.weight !== base.weight || current.reps !== base.reps)
  })
  const unsavedRef = useRef(false)
  unsavedRef.current = hasUnsavedInput

  // --- Persistencia del temporizador: cada 15 s, al ocultar la pestaña y al cerrarla ---
  useEffect(() => {
    if (!timerEnabled || !watch.running) return
    const id = setInterval(() => {
      updateWorkoutSession(workout.id, { elapsed_seconds: watch.read() }).catch(() => {})
    }, 15000)
    return () => clearInterval(id)
  }, [timerEnabled, watch.running, watch.read, workout.id])

  useEffect(() => {
    function persist() {
      if (timerEnabled && watch.running) {
        updateWorkoutSession(workout.id, { elapsed_seconds: watch.read() }).catch(() => {})
      }
    }
    function onVisibility() {
      if (document.visibilityState === 'hidden') persist()
    }
    function onBeforeUnload(e: BeforeUnloadEvent) {
      persist()
      if (unsavedRef.current) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [timerEnabled, watch.running, watch.read, workout.id])

  // --- Navegación entre ejercicios (el temporizador NO se toca) ---
  function pickInitialSet(exerciseIndex: number, source: Record<string, WorkoutSetRow>): string | null {
    const ex = exercises[exerciseIndex]
    if (!ex) return null
    const list = ex.workout_sets.map((s) => source[s.id])
    return (list.find((s) => !s.completed_at) ?? list[0])?.id ?? null
  }

  function goToExercise(index: number) {
    if (index < 0 || index >= exercises.length) return
    setExIndex(index)
    setSelectedSetId(pickInitialSet(index, sets))
    setInputError(null)
    setActionError(null)
  }

  function updateInput(field: keyof SetInput, value: string) {
    if (!selectedSetId) return
    setInputs((prev) => ({ ...prev, [selectedSetId]: { ...prev[selectedSetId], [field]: value } }))
  }

  function selectSet(id: string) {
    setSelectedSetId(id)
    setInputError(null)
  }

  async function handleCompleteSet() {
    if (!selectedSet || !selectedInput || paused) return
    setInputError(null)
    setActionError(null)
    const parsed = parseSetInput(selectedInput)
    if ('error' in parsed) {
      setInputError(parsed.error)
      return
    }

    setSavingSetId(selectedSet.id)
    try {
      const completedAt = await saveSetResult(selectedSet.id, parsed.weight, parsed.reps)
      const updated: WorkoutSetRow = {
        ...selectedSet,
        actual_weight_kg: parsed.weight,
        actual_reps: parsed.reps,
        completed_at: completedAt,
      }
      const nextSets = { ...sets, [selectedSet.id]: updated }
      setSets(nextSets)
      // Pasar a la siguiente serie pendiente del ejercicio (si queda alguna).
      const list = currentExercise.workout_sets.map((s) => nextSets[s.id])
      const next =
        list.find((s) => s.set_number > selectedSet.set_number && !s.completed_at) ??
        list.find((s) => !s.completed_at)
      if (next) setSelectedSetId(next.id)
    } catch {
      setActionError('No se pudo guardar la serie. Comprueba tu conexión e inténtalo de nuevo.')
    }
    setSavingSetId(null)
  }

  async function handleUndoSet() {
    if (!selectedSet || paused) return
    setActionError(null)
    setSavingSetId(selectedSet.id)
    try {
      await clearSetCompletion(selectedSet.id)
      setSets((prev) => ({ ...prev, [selectedSet.id]: { ...prev[selectedSet.id], completed_at: null } }))
    } catch {
      setActionError('No se pudo deshacer la serie. Inténtalo de nuevo.')
    }
    setSavingSetId(null)
  }

  // --- Pausa / reanudación del temporizador global ---
  async function handlePause() {
    const seconds = watch.pause()
    setPaused(true)
    try {
      await updateWorkoutSession(workout.id, { status: 'paused', elapsed_seconds: seconds })
    } catch {
      setActionError('No se pudo guardar la pausa, pero el temporizador está detenido.')
    }
  }

  async function handleResume() {
    watch.resume()
    setPaused(false)
    try {
      await updateWorkoutSession(workout.id, { status: 'active' })
    } catch {
      setActionError('No se pudo guardar la reanudación, pero el temporizador sigue en marcha.')
    }
  }

  // --- Salir / abandonar / finalizar ---
  function requestExit() {
    setDialogError(null)
    setDialog('exit')
  }

  async function handleSaveAndExit() {
    setDialogBusy(true)
    setDialogError(null)
    try {
      if (timerEnabled && !paused) {
        const seconds = watch.pause()
        setPaused(true)
        await updateWorkoutSession(workout.id, { status: 'paused', elapsed_seconds: seconds })
      }
      navigate('/rutinas')
    } catch {
      setDialogError('No se pudo guardar el estado. Inténtalo de nuevo.')
      setDialogBusy(false)
    }
  }

  async function handleAbandon() {
    setDialogBusy(true)
    setDialogError(null)
    try {
      const seconds = timerEnabled ? watch.pause() : 0
      await updateWorkoutSession(workout.id, {
        status: 'abandoned',
        elapsed_seconds: seconds,
        completed_at: new Date().toISOString(),
      })
      navigate('/rutinas')
    } catch {
      setDialogError('No se pudo abandonar el entrenamiento. Inténtalo de nuevo.')
      setDialogBusy(false)
    }
  }

  async function handleFinish() {
    setDialogBusy(true)
    setDialogError(null)
    try {
      const seconds = timerEnabled ? watch.pause() : 0
      await updateWorkoutSession(workout.id, {
        status: 'completed',
        elapsed_seconds: seconds,
        completed_at: new Date().toISOString(),
      })
      onFinished()
    } catch {
      setDialogError('No se pudo finalizar el entrenamiento. Inténtalo de nuevo.')
      setDialogBusy(false)
    }
  }

  if (!currentExercise) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-textSecondary">
        Este entrenamiento no tiene ejercicios.
      </div>
    )
  }

  const percent = totals.total === 0 ? 0 : Math.round((totals.done / totals.total) * 100)
  const isSaving = savingSetId !== null
  const selectedIsDone = !!selectedSet?.completed_at
  const editingDisabled = paused || isSaving

  return (
    <div className="flex flex-col gap-4">
      {/* Cabecera: sesión, temporizador global y salida */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Sesión en curso</p>
            <p className="truncate font-heading text-base font-bold text-textPrimary">
              {workout.routines?.name ?? 'Entrenamiento'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {timerEnabled && (
              <>
                <span className="inline-flex items-center gap-1.5 font-heading text-lg font-bold tabular-nums text-textPrimary">
                  <Timer size={18} className={paused ? 'text-warning' : 'text-primary'} />
                  {formatDuration(watch.seconds)}
                </span>
                <button
                  type="button"
                  onClick={paused ? handleResume : handlePause}
                  aria-label={paused ? 'Reanudar temporizador' : 'Pausar temporizador'}
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-textPrimary hover:bg-border/60"
                >
                  {paused ? <Play size={18} /> : <Pause size={18} />}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={requestExit}
              aria-label="Salir del entrenamiento"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-background text-textSecondary hover:bg-critical/10 hover:text-critical"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {paused && (
        <div className="flex flex-col gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-textPrimary">Entrenamiento pausado</p>
            <p className="text-xs text-textSecondary">El tiempo global está detenido. Reanuda para seguir registrando series.</p>
          </div>
          <button
            type="button"
            onClick={handleResume}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <Play size={16} /> Reanudar
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">{actionError}</div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_16rem]">
        <div className="flex flex-col gap-4">
          {/* Ejercicio actual y series */}
          <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
            <div className="flex items-center justify-between text-xs text-textSecondary">
              <span>
                Ejercicio {exIndex + 1} de {exercises.length}
                {currentExercise.exercises?.muscle_groups?.name && <> · {currentExercise.exercises.muscle_groups.name}</>}
              </span>
              <span>{percent}% completado</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <h2 className="font-heading text-xl font-bold text-textPrimary">
                {currentExercise.exercise_name_snapshot}
              </h2>
              <button
                type="button"
                onClick={() => setShowProgression(true)}
                title="Ver progresión de peso"
                className="shrink-0 rounded-lg p-2 text-textSecondary hover:bg-background"
              >
                <TrendingUp size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {currentSets.map((set) => {
                const isSelected = set.id === selectedSetId
                const done = !!set.completed_at
                return (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => selectSet(set.id)}
                    className={`flex min-h-[3.5rem] items-center justify-between gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-primary/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          done ? 'bg-success text-white' : 'bg-surface text-textSecondary'
                        }`}
                      >
                        {done ? <Check size={16} /> : set.set_number}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-textPrimary">
                          Serie {set.set_number}
                          {done && <span className="ml-2 text-xs font-medium text-success">Completada</span>}
                        </span>
                        <span className="block text-xs text-textSecondary">
                          Plan: {formatSetValues(set.planned_weight_kg, set.planned_reps)}
                        </span>
                      </span>
                    </span>
                    {done && (
                      <span className="shrink-0 text-sm font-semibold text-textPrimary">
                        {formatSetValues(set.actual_weight_kg, set.actual_reps)}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Registro de la serie seleccionada */}
          {selectedSet && selectedInput && (
            <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-heading text-base font-bold text-textPrimary">
                  Registro de la serie {selectedSet.set_number}
                </h3>
                <span className="text-xs text-textSecondary">
                  Planificado: {formatSetValues(selectedSet.planned_weight_kg, selectedSet.planned_reps)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <NumberStepper
                  id="actual-weight"
                  label="Peso real"
                  unit="kg"
                  value={selectedInput.weight}
                  step={2.5}
                  inputMode="decimal"
                  disabled={editingDisabled}
                  onChange={(v) => updateInput('weight', v)}
                />
                <NumberStepper
                  id="actual-reps"
                  label="Repeticiones reales"
                  unit="reps"
                  value={selectedInput.reps}
                  step={1}
                  inputMode="numeric"
                  disabled={editingDisabled}
                  onChange={(v) => updateInput('reps', v)}
                />
              </div>

              {inputError && <p className="mt-3 text-sm text-critical">{inputError}</p>}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCompleteSet}
                  disabled={editingDisabled}
                  className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  <Check size={20} />
                  {savingSetId === selectedSet.id
                    ? 'Guardando...'
                    : selectedIsDone
                      ? `Actualizar serie ${selectedSet.set_number}`
                      : `Completar serie ${selectedSet.set_number}`}
                </button>
                {selectedIsDone && (
                  <button
                    type="button"
                    onClick={handleUndoSet}
                    disabled={editingDisabled}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-background px-5 text-sm font-semibold text-textSecondary hover:bg-border/60 disabled:opacity-60"
                  >
                    <Undo2 size={18} /> Marcar pendiente
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Anterior / siguiente ejercicio */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => goToExercise(exIndex - 1)}
              disabled={exIndex === 0}
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-surface px-3 text-sm font-semibold text-textPrimary border border-border hover:bg-background disabled:opacity-40"
            >
              <ChevronLeft size={18} /> Anterior
            </button>
            <button
              type="button"
              onClick={() => goToExercise(exIndex + 1)}
              disabled={exIndex === exercises.length - 1}
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-surface px-3 text-sm font-semibold text-textPrimary border border-border hover:bg-background disabled:opacity-40"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Ruta del entrenamiento */}
        <div className="h-fit rounded-xl border border-border bg-surface p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Ruta del entrenamiento</p>
          <ol className="mt-3 flex flex-col gap-1.5">
            {exercises.map((ex, index) => {
              const done = ex.workout_sets.filter((s) => sets[s.id]?.completed_at).length
              const complete = ex.workout_sets.length > 0 && done === ex.workout_sets.length
              return (
                <li key={ex.id}>
                  <button
                    type="button"
                    onClick={() => goToExercise(index)}
                    className={`flex min-h-[2.75rem] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      index === exIndex ? 'bg-primary/10 font-semibold text-primary' : 'text-textPrimary hover:bg-background'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="text-xs text-textSecondary">{index + 1}</span>
                      <span className="truncate">{ex.exercise_name_snapshot}</span>
                    </span>
                    <span className={`shrink-0 text-xs ${complete ? 'text-success' : 'text-textSecondary'}`}>
                      {complete ? <Check size={14} /> : `${done}/${ex.workout_sets.length}`}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="mt-4 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => {
                setDialogError(null)
                setDialog('finish')
              }}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white shadow-sm hover:bg-success/90"
            >
              <Flag size={16} /> Finalizar entrenamiento
            </button>
          </div>
        </div>
      </div>

      {dialog === 'exit' && (
        <ExitWorkoutDialog
          timerEnabled={timerEnabled}
          busy={dialogBusy}
          error={dialogError}
          onContinue={() => setDialog(null)}
          onSaveAndExit={handleSaveAndExit}
          onAbandon={handleAbandon}
        />
      )}
      {dialog === 'finish' && (
        <FinishWorkoutDialog
          pendingSets={totals.pending}
          busy={dialogBusy}
          error={dialogError}
          onCancel={() => setDialog(null)}
          onConfirm={handleFinish}
        />
      )}

      {showProgression && currentExercise && (
        <ExerciseProgressionDialog
          exerciseId={currentExercise.exercise_id}
          exerciseName={currentExercise.exercise_name_snapshot}
          onClose={() => setShowProgression(false)}
        />
      )}
    </div>
  )
}
