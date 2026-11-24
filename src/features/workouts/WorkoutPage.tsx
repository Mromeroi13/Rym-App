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

  // Recarga silenciosa cuando el WorkoutRunner reemplaza un ejercicio sobre la marcha.
  // No usa setState('loading') para no interrumpir la sesión con un spinner.
  useEffect(() => {
    async function silentReload() {
      if (!sessionId) return
      try {
        const data = await fetchWorkout(sessionId)
        if (data) setWorkout(data)
      } catch {
        // Error silencioso: el runner ya tiene los datos actualizados en memoria
      }
    }
    window.addEventListener('rym:workout-exercise-replaced', silentReload)
    return () => window.removeEventListener('rym:workout-exercise-replaced', silentReload)
  }, [sessionId])

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
