import { useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  filterProgressionByRange,
  formatKg,
  formatProgressionTooltip,
  formatSignedKg,
  progressionSummary,
  type ProgressionPoint,
  type ProgressionRange,
} from '../metrics'
import { formatLongDate, todayKey } from '@/utils/dates'

const RANGE_OPTIONS: { value: ProgressionRange; label: string }[] = [
  { value: '1m', label: '1 mes' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: 'all', label: 'Todo' },
]

interface ExerciseProgressionChartProps {
  points: ProgressionPoint[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

function TooltipContent({ point }: { point: ProgressionPoint }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
      <p className="text-xs font-semibold capitalize text-textPrimary">{formatLongDate(point.date)}</p>
      <p className="mt-1 text-sm font-bold text-primary">{formatKg(point.topWeightKg)}</p>
      <p className="mt-1 text-xs text-textSecondary">{formatProgressionTooltip(point)}</p>
    </div>
  )
}

/**
 * Gráfica de progresión de un ejercicio (PROG-01/02/03/05). Solo presenta: la lectura y
 * el cálculo vienen ya resueltos por progressApi.ts y metrics.ts.
 */
export function ExerciseProgressionChart({ points, loading, error, onRetry }: ExerciseProgressionChartProps) {
  const [range, setRange] = useState<ProgressionRange>('3m')

  const filtered = useMemo(() => filterProgressionByRange(points, range, todayKey()), [points, range])
  const summary = useMemo(() => progressionSummary(filtered), [filtered])
  const pointByDate = useMemo(() => new Map(filtered.map((p) => [p.date, p])), [filtered])

  if (loading) {
    return <p className="py-6 text-center text-sm text-textSecondary">Cargando progresión...</p>
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-sm text-critical">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-background px-3 py-1.5 text-xs font-semibold text-textPrimary hover:bg-border/60"
        >
          Reintentar
        </button>
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <p className="rounded-xl bg-background p-4 text-center text-sm text-textSecondary">
        Aún no has entrenado este ejercicio con peso.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRange(option.value)}
            aria-pressed={range === option.value}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              range === option.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-background text-textSecondary hover:text-textPrimary'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-background p-4 text-center text-sm text-textSecondary">
          Sin entrenamientos de este ejercicio en este rango.
        </p>
      ) : filtered.length === 1 ? (
        <div className="rounded-xl bg-background p-4 text-center">
          <p className="text-sm text-textPrimary">
            Un solo entrenamiento registrado: <span className="font-semibold">{formatKg(filtered[0].topWeightKg)}</span>
          </p>
          <p className="mt-1 text-xs text-textSecondary">
            Entrena este ejercicio otra vez para ver la tendencia.
          </p>
        </div>
      ) : (
        <>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filtered} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(value: string) => value.slice(5)}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(value: number) => `${value}`}
                />
                <Tooltip
                  content={({ label }) => {
                    const point = pointByDate.get(label as string)
                    return point ? <TooltipContent point={point} /> : null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="topWeightKg"
                  stroke="#0062FF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0062FF' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {summary && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Primero</p>
                <p className="mt-1 text-sm font-bold text-textPrimary">{formatKg(summary.firstKg)}</p>
              </div>
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Actual</p>
                <p className="mt-1 text-sm font-bold text-textPrimary">{formatKg(summary.currentKg)}</p>
              </div>
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Mejor</p>
                <p className="mt-1 text-sm font-bold text-textPrimary">{formatKg(summary.bestKg)}</p>
              </div>
              <div className="rounded-xl bg-background p-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Cambio</p>
                <p
                  className={`mt-1 text-sm font-bold ${
                    summary.changeKg > 0 ? 'text-success' : summary.changeKg < 0 ? 'text-critical' : 'text-textPrimary'
                  }`}
                >
                  {formatSignedKg(summary.changeKg)}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
