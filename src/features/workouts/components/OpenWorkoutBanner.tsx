import { Link } from 'react-router-dom'
import { PlayCircle } from 'lucide-react'
import { useOpenWorkout } from '../hooks/useOpenWorkout'

export function OpenWorkoutBanner() {
  const { openWorkout } = useOpenWorkout()
  if (!openWorkout) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-textPrimary">
          Tienes un entrenamiento {openWorkout.status === 'paused' ? 'en pausa' : 'en curso'}
        </p>
        <p className="truncate text-xs text-textSecondary">{openWorkout.routineName ?? 'Entrenamiento'}</p>
      </div>
      <Link
        to={`/entrenamiento/${openWorkout.id}`}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
      >
        <PlayCircle size={16} />
        Continuar
      </Link>
    </div>
  )
}
