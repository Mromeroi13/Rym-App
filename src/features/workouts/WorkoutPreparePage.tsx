import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Timer, TimerOff } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { fetchRoutine } from '@/features/routines/routineApi'
import { countSets } from '@/features/routines/utils'
import type { RoutineWithDetails } from '@/features/routines/types'
import { startWorkout } from './workoutApi'
import { summarizePlanned } from './workoutUtils'
import { useOpenWorkout } from './hooks/useOpenWorkout'
import { WorkoutShell } from './components/WorkoutShell'

type LoadState = 'loading' | 'ready' | 'notfound' | 'error'

export function WorkoutPreparePage() {
  const { routineId } = useParams<{ routineId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { openWorkout, loading: openLoading } = useOpenWorkout()
  // Fecha a cumplir (WK-09): presente solo si se llegó desde una asignación (Calendario u Home).
  const [searchParams] = useSearchParams()
  const scheduledDate = searchParams.get('fecha')

  const [routine, setRoutine] = useState<RoutineWithDetails | null>(null)
  const [state, setState] = useState<LoadState>('loading')
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  useEffect(() => {
    if (!routineId) return
    let cancelled = false
    setState('loading')
    fetchRoutine(routineId)
      .then((data) => {
        if (cancelled) return
        setRoutine(data)
        setState(data ? 'ready' : 'notfound')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [routineId])

  async function handleStart(timerEnabled: boolean) {
    if (!routine || !profile) return
    setStartError(null)
    setStarting(true)
    try {
      const sessionId = await startWorkout(profile.id, routine, timerEnabled, scheduledDate)
      navigate(`/entrenamiento/${sessionId}`, { replace: true })
    } catch (err) {
      const code = (err as { code?: string } | null)?.code
      setStartError(
        code === '23505'
          ? 'Ya tienes un entrenamiento sin terminar. Continúalo o abandónalo antes de empezar otro.'
          : 'No se pudo iniciar el entrenamiento. Inténtalo de nuevo.',
      )
      setStarting(false)
    }
  }

  const totalSets = routine ? countSets(routine) : 0
  const blocked = !!openWorkout
  const startDisabled = starting || openLoading || blocked || totalSets === 0

  return (
    <WorkoutShell>
      <div className="mx-auto max-w-2xl">
        <Link to="/rutinas" className="inline-flex items-center gap-1.5 text-sm font-medium text-textSecondary hover:text-textPrimary">
          <ArrowLeft size={16} /> Volver a Rutinas
        </Link>

        {state === 'loading' && <p className="mt-6 text-sm text-textSecondary">Cargando rutina...</p>}
        {(state === 'notfound' || state === 'error') && (
          <div className="mt-6 rounded-xl border border-border bg-surface p-6 text-sm text-textPrimary">
            {state === 'notfound' ? 'No se encontró esta rutina.' : 'No se pudo cargar la rutina.'}
          </div>
        )}

        {state === 'ready' && routine && (
          <div className="mt-4 rounded-xl border border-border bg-surface p-5 md:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Entrenamiento físico</p>
            <h1 className="mt-1 font-heading text-2xl font-bold text-textPrimary">{routine.name}</h1>
            {routine.description && <p className="mt-1 text-sm text-textSecondary">{routine.description}</p>}

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-background p-4 text-center">
                <p className="font-heading text-2xl font-bold text-textPrimary">{routine.routine_exercises.length}</p>
                <p className="text-xs text-textSecondary">Ejercicios</p>
              </div>
              <div className="rounded-xl border border-border bg-background p-4 text-center">
                <p className="font-heading text-2xl font-bold text-textPrimary">{totalSets}</p>
                <p className="text-xs text-textSecondary">Series totales</p>
              </div>
            </div>

            <h2 className="mt-6 text-xs font-bold uppercase tracking-wider text-textSecondary">
              Ejercicios y cargas planificadas
            </h2>
            <ol className="mt-3 flex flex-col gap-2">
              {routine.routine_exercises.map((re, index) => (
                <li key={re.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-xs text-textSecondary">
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-textPrimary">{re.exercises?.name ?? 'Ejercicio'}</span>
                      <span className="block truncate text-xs text-textSecondary">{re.exercises?.muscle_groups?.name ?? 'Sin grupo'}</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-right">
                    <span className="block text-sm font-semibold text-textPrimary">{re.routine_sets.length} series</span>
                    <span className="block text-xs text-textSecondary">{summarizePlanned(re.routine_sets, re.mode)}</span>
                  </span>
                </li>
              ))}
            </ol>

            {blocked && openWorkout && (
              <div className="mt-6 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm text-textPrimary">
                Ya tienes un entrenamiento {openWorkout.status === 'paused' ? 'en pausa' : 'en curso'}
                {openWorkout.routineName ? ` (${openWorkout.routineName})` : ''}. Termínalo o abandónalo antes de empezar otro.
                <Link to={`/entrenamiento/${openWorkout.id}`} className="mt-2 block font-semibold text-primary">
                  Continuar entrenamiento
                </Link>
              </div>
            )}
            {totalSets === 0 && (
              <p className="mt-6 text-sm text-critical">Esta rutina no tiene series. Edítala para poder entrenarla.</p>
            )}
            {startError && <p className="mt-4 text-sm text-critical">{startError}</p>}

            <div className="mt-6 border-t border-border pt-6">
              <p className="text-center text-xs font-bold uppercase tracking-wider text-textSecondary">
                Selecciona cómo deseas registrar la sesión
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleStart(true)}
                  disabled={startDisabled}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  <Timer size={20} />
                  {starting ? 'Iniciando...' : 'Comenzar con temporizador'}
                </button>
                <button
                  type="button"
                  onClick={() => handleStart(false)}
                  disabled={startDisabled}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-base font-semibold text-textPrimary transition-colors hover:bg-background disabled:opacity-50"
                >
                  <TimerOff size={20} />
                  Comenzar sin temporizador
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WorkoutShell>
  )
}
