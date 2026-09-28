import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchWorkout } from './workoutApi'
import type { WorkoutWithDetails } from './workoutTypes'
import { WorkoutShell } from './components/WorkoutShell'
import { WorkoutRunner } from './components/WorkoutRunner'
import { WorkoutSummary } from './components/WorkoutSummary'

type LoadState = 'loading' | 'ready' | 'notfound' | 'error'

export function WorkoutPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [workout, setWorkout] = useState<WorkoutWithDetails | null>(null)
  const [state, setState] = useState<LoadState>('loading')

  const load = useCallback(async () => {
    if (!sessionId) return
    setState('loading')
    try {
      const data = await fetchWorkout(sessionId)
      setWorkout(data)
      setState(data ? 'ready' : 'notfound')
    } catch {
      setState('error')
    }
  }, [sessionId])

  useEffect(() => {
    load()
  }, [load])

  if (state === 'loading') {
    return (
      <WorkoutShell>
        <p className="text-sm text-textSecondary">Cargando entrenamiento...</p>
      </WorkoutShell>
    )
  }

  if (state !== 'ready' || !workout) {
    return (
      <WorkoutShell>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-textPrimary">
            {state === 'notfound' ? 'No se encontró este entrenamiento.' : 'No se pudo cargar el entrenamiento.'}
          </p>
          <div className="mt-3 flex items-center gap-4">
            {state === 'error' && (
              <button type="button" onClick={load} className="text-sm font-semibold text-primary">
                Reintentar
              </button>
            )}
            <Link to="/rutinas" className="text-sm font-semibold text-primary">
              Volver a Rutinas
            </Link>
          </div>
        </div>
      </WorkoutShell>
    )
  }

  const isOpen = workout.status === 'active' || workout.status === 'paused'

  return (
    <WorkoutShell>
      {isOpen ? (
        // key: si se recarga la sesión, el ejecutor se reinicia con los datos del servidor
        <WorkoutRunner key={workout.id} workout={workout} onFinished={load} />
      ) : (
        <WorkoutSummary workout={workout} />
      )}
    </WorkoutShell>
  )
}
