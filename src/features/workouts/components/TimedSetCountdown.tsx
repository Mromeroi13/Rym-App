import { useCountdown } from '../hooks/useCountdown'
import { formatCountdown } from '../timer'

interface TimedSetCountdownProps {
  seconds: number
  paused: boolean
  onComplete: () => void
}

/**
 * Se monta con `key={set.id}` desde WorkoutRunner: cambiar de serie desmonta
 * la anterior (limpia su intervalo) y monta esta de cero, sin arrastrar
 * estado entre series.
 */
export function TimedSetCountdown({ seconds, paused, onComplete }: TimedSetCountdownProps) {
  const remaining = useCountdown(seconds, paused, onComplete)
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-background p-8">
      <span className="font-heading text-5xl font-bold tabular-nums text-textPrimary">
        {formatCountdown(remaining)}
      </span>
      <span className="text-xs text-textSecondary">{paused ? 'En pausa' : 'En marcha...'}</span>
    </div>
  )
}
