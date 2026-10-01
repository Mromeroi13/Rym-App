import { useMemo, useState } from 'react'
import {
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { BodyWeightLog } from '../bodyWeightApi'

type Range = '1m' | '3m' | '6m' | 'all'

const RANGE_OPTIONS: { value: Range; label: string }[] = [
  { value: '1m', label: '1 mes' },
  { value: '3m', label: '3 meses' },
  { value: '6m', label: '6 meses' },
  { value: 'all', label: 'Todo' },
]

function filterByRange(logs: BodyWeightLog[], range: Range): BodyWeightLog[] {
  if (range === 'all') return logs
  const now = new Date()
  const months = range === '1m' ? 1 : range === '3m' ? 3 : 6
  const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate())
  const cutoffKey = cutoff.toISOString().slice(0, 10)
  return logs.filter((l) => l.logged_date >= cutoffKey)
}

function formatDate(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

function formatKg(v: number) {
  return `${v.toFixed(1)} kg`
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { date: string; weight: number; note?: string | null } }[] }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-border bg-surface p-3 shadow-lg">
      <p className="text-xs font-semibold text-textPrimary">{formatDate(p.date)}</p>
      <p className="mt-1 text-sm font-bold text-primary">{formatKg(p.weight)}</p>
      {p.note && <p className="mt-1 text-xs text-textSecondary">{p.note}</p>}
    </div>
  )
}

interface BodyWeightChartProps {
  logs: BodyWeightLog[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function BodyWeightChart({ logs, loading, error, onRetry }: BodyWeightChartProps) {
  const [range, setRange] = useState<Range>('3m')

  const filtered = useMemo(() => filterByRange(logs, range), [logs, range])
  const points = useMemo(
    () => filtered.map((l) => ({ date: l.logged_date, weight: Number(l.weight_kg), note: l.note })),
    [filtered],
  )

  const weights = points.map((p) => p.weight)
  const minW = weights.length ? Math.floor(Math.min(...weights) - 1) : 50
  const maxW = weights.length ? Math.ceil(Math.max(...weights) + 1) : 100
  const avg = weights.length ? weights.reduce((a, b) => a + b, 0) / weights.length : null
  const first = points[0]
  const last = points[points.length - 1]
  const diff = first && last && points.length >= 2 ? last.weight - first.weight : null

  if (loading) return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-background">
      <p className="text-sm text-textSecondary">Cargando...</p>
    </div>
  )

  if (error) return (
    <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl bg-background">
      <p className="text-sm text-critical">{error}</p>
      <button type="button" onClick={onRetry} className="rounded-lg bg-surface px-4 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
        Reintentar
      </button>
    </div>
  )

  if (points.length === 0) return (
    <div className="flex h-48 items-center justify-center rounded-xl bg-background">
      <p className="text-sm text-textSecondary">
        {range === 'all' ? 'Añade tu primer registro para ver la gráfica.' : 'Sin datos en este periodo.'}
      </p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1.5">
        {RANGE_OPTIONS.map((opt) => (
          <button key={opt.value} type="button" onClick={() => setRange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${range === opt.value ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'}`}>
            {opt.label}
          </button>
        ))}
      </div>

      {points.length >= 2 && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Inicio', value: formatKg(first.weight), neutral: true, diff: null },
            { label: 'Actual', value: formatKg(last.weight), neutral: true, diff: null },
            {
              label: 'Cambio',
              value: diff === null ? '—' : `${diff > 0 ? '+' : ''}${diff.toFixed(1)} kg`,
              neutral: false,
              diff,
            },
          ].map(({ label, value, diff: d, neutral }) => (
            <div key={label} className="rounded-xl bg-background p-3 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">{label}</p>
              <p className={`mt-0.5 font-heading text-base font-bold ${neutral || d === null || d === 0 ? 'text-textPrimary' : d < 0 ? 'text-success' : 'text-critical'}`}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis domain={[minW, maxW]} tickFormatter={(v) => `${v}`} tick={{ fontSize: 11, fill: '#6B7280' }} tickLine={false} axisLine={false} width={36} />
            <Tooltip content={<CustomTooltip />} />
            {avg !== null && <ReferenceLine y={avg} stroke="#6B7280" strokeDasharray="4 4" strokeWidth={1} />}
            <Line type="monotone" dataKey="weight" stroke="#0062FF" strokeWidth={2} dot={{ r: 3, fill: '#0062FF', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#0062FF', strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
