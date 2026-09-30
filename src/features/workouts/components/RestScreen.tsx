import { SkipForward } from 'lucide-react'
import { useCountdown } from '../hooks/useCountdown'
import { formatCountdown } from '../timer'

interface RestScreenProps {
  seconds: number
  paused: boolean
  nextExerciseName: string
  onComplete: () => void
  onSkip: () => void
}

/**
 * Se monta con key={`rest-${fromIndex}`} desde WorkoutRunner, así que cada
 * descanso arranca su propia cuenta atrás limpia. Al llegar a 0 avisa con
 * sonido y avanza sola; "Saltar descanso" avanza sin sonido y de inmediato
 * desmonta este componente (el botón no puede volver a pulsarse dos veces).
 */
export function RestScreen({ seconds, paused, nextExerciseName, onComplete, onSkip }: RestScreenProps) {
  const remaining = useCountdown(seconds, paused, onComplete)
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-8 text-center">
      <p className="text-xs font-bold uppercase tracking-wider text-primary">Descanso</p>
      <p className="font-heading text-6xl font-bold tabular-nums text-textPrimary">{formatCountdown(remaining)}</p>
      {nextExerciseName && (
        <p className="text-sm text-textSecondary">
          Siguiente: <span className="font-semibold text-textPrimary">{nextExerciseName}</span>
        </p>
      )}
      <button
        type="button"
        onClick={onSkip}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-textPrimary hover:bg-border/60"
      >
        <SkipForward size={16} /> Saltar descanso
      </button>
      {paused && <p className="text-xs text-warning">Entrenamiento en pausa: el descanso está detenido.</p>}
    </div>
  )
}
