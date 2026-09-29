import { Link } from 'react-router-dom'
import { ChevronRight, TrendingUp } from 'lucide-react'
import type { MonthlyProgress } from '../../progress/hooks/useMonthlyProgress'
import { formatSignedKg, formatVolumeKg } from '../../progress/metrics'

interface MonthlyProgressCardProps {
  data: MonthlyProgress | null
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function MonthlyProgressCard({ data, loading, error, onRetry }: MonthlyProgressCardProps) {
  const monthLabel = new Date().toLocaleDateString('es-ES', { month: 'long' })

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
          Progreso de {monthLabel}
        </span>
        <Link to="/progreso" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          Ver Progreso <ChevronRight size={14} />
        </Link>
      </div>

      {loading && <p className="mt-3 text-sm text-textSecondary">Cargando tu progreso...</p>}

      {!loading && error && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          <span>{error}</span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && data && data.totals.workouts === 0 && (
        <p className="mt-3 rounded-xl bg-background p-4 text-sm text-textSecondary">
          Todavía no has completado ningún entrenamiento este mes.
        </p>
      )}

      {!loading && !error && data && data.totals.workouts > 0 && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-background p-3.5">
              <p className="font-heading text-xl font-bold text-textPrimary">{data.totals.workouts}</p>
              <p className="text-xs text-textSecondary">Entrenamientos este mes</p>
            </div>
            <div className="rounded-xl bg-background p-3.5">
              <p className="font-heading text-xl font-bold text-textPrimary">{data.totals.setsPerformed}</p>
              <p className="text-xs text-textSecondary">Series realizadas</p>
            </div>
            <div className="rounded-xl bg-background p-3.5">
              <p className="font-heading text-xl font-bold text-textPrimary">{formatVolumeKg(data.totals.volumeKg)}</p>
              <p className="text-xs text-textSecondary">Volumen acumulado</p>
            </div>
            <div className="rounded-xl bg-background p-3.5">
              <p className="font-heading text-xl font-bold text-textPrimary">{data.increasedWeight.length}</p>
              <p className="text-xs text-textSecondary">Ejercicios con más peso</p>
            </div>
          </div>

          {data.increasedWeight.length > 0 && (
            <div className="mt-3 flex flex-col gap-1.5">
              {data.increasedWeight.slice(0, 4).map((item) => (
                <div
                  key={item.exerciseId}
                  className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-sm"
                >
                  <span className="inline-flex min-w-0 items-center gap-2 truncate">
                    <TrendingUp size={14} className="shrink-0 text-success" />
                    <span className="truncate text-textPrimary">{item.name}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-success">{formatSignedKg(item.gainKg)}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
