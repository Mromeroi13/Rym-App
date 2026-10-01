import { Flame } from 'lucide-react'
import type { StreakResult } from '../streakUtils'

interface StreakCardProps {
  streak: StreakResult | null
  loading: boolean
  error: string | null
}

function StreakDots({ current }: { current: number }) {
  // Muestra los últimos 7 días como puntos rellenos/vacíos
  const dots = Math.min(current, 7)
  return (
    <div className="mt-3 flex items-center gap-1.5">
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i < dots ? 'bg-warning' : 'bg-border'
          }`}
        />
      ))}
      {current > 7 && (
        <span className="ml-1 text-xs font-semibold text-warning">+{current - 7}</span>
      )}
    </div>
  )
}

export function StreakCard({ streak, loading, error }: StreakCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-textSecondary">Calculando racha...</p>
      </div>
    )
  }

  if (error || !streak) {
    return null
  }

  const { current, best, trainedToday } = streak

  const flameColor =
    current === 0 ? 'text-textSecondary' : current >= 7 ? 'text-warning' : 'text-orange-400'

  const label =
    current === 0
      ? 'Sin racha activa'
      : current === 1
        ? '1 día seguido'
        : `${current} días seguidos`

  return (
    <div
      className={`rounded-xl border bg-surface p-5 transition-colors ${
        current > 0 ? 'border-warning/30' : 'border-border'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Racha actual
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="font-heading text-3xl font-bold text-textPrimary">{current}</p>
            <p className="text-sm text-textSecondary">
              {current === 1 ? 'día' : 'días'}
            </p>
          </div>
          <p className="mt-0.5 text-xs text-textSecondary">{label}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Flame
            size={32}
            className={`transition-colors ${flameColor}`}
            fill={current > 0 ? 'currentColor' : 'none'}
          />
          {trainedToday && (
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
              ¡Hoy entrenado!
            </span>
          )}
        </div>
      </div>

      <StreakDots current={current} />

      {best > 0 && (
        <p className="mt-3 text-xs text-textSecondary">
          Mejor racha:{' '}
          <span className="font-semibold text-textPrimary">{best} {best === 1 ? 'día' : 'días'}</span>
        </p>
      )}
    </div>
  )
}
