import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatWeekChange, type WeeklySets } from '../metrics'
import { formatLongDate, todayKey } from '@/utils/dates'

interface WeeklyMuscleGroupsCardProps {
  data: WeeklySets | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onShiftWeek: (delta: -1 | 1) => void
  onGoToCurrentWeek: () => void
  isCurrentWeek: boolean
}

function changeColor(change: number): string {
  if (change > 0) return 'text-success'
  if (change < 0) return 'text-critical'
  return 'text-textSecondary'
}

export function WeeklyMuscleGroupsCard({
  data,
  loading,
  error,
  onRetry,
  onShiftWeek,
  onGoToCurrentWeek,
  isCurrentWeek,
}: WeeklyMuscleGroupsCardProps) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const maxSets = data ? Math.max(1, ...data.groups.map((g) => g.sets)) : 1

  return (
    <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-bold text-textPrimary">Series por grupo muscular</h2>
          {data && (
            <p className="mt-0.5 text-xs capitalize text-textSecondary">
              {formatLongDate(data.weekStart)} – {formatLongDate(data.weekEnd)}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {!isCurrentWeek && (
            <button
              type="button"
              onClick={onGoToCurrentWeek}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
            >
              Hoy
            </button>
          )}
          <button
            type="button"
            onClick={() => onShiftWeek(-1)}
            aria-label="Semana anterior"
            className="rounded-lg p-2 text-textSecondary hover:bg-background"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => onShiftWeek(1)}
            disabled={isCurrentWeek}
            aria-label="Semana siguiente"
            className="rounded-lg p-2 text-textSecondary hover:bg-background disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading && <p className="mt-4 text-sm text-textSecondary">Cargando series de la semana...</p>}

      {!loading && error && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
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

      {!loading && !error && data && (
        <>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-background p-3.5">
            <span className="text-sm font-semibold text-textPrimary">Total de la semana</span>
            <span className="inline-flex items-baseline gap-2">
              <span className="font-heading text-lg font-bold text-textPrimary">{data.total} series</span>
              <span className={`text-xs font-semibold ${changeColor(data.change)}`}>
                {formatWeekChange(data.change)} vs. semana anterior
              </span>
            </span>
          </div>

          {data.total === 0 ? (
            <p className="mt-4 rounded-xl bg-background p-4 text-center text-sm text-textSecondary">
              No hay series registradas esta semana.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {data.groups.map((group) => {
                const isExpanded = expanded === group.muscleGroupId
                return (
                  <li key={group.muscleGroupId} className="rounded-xl border border-border">
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : group.muscleGroupId)}
                      disabled={group.exercises.length === 0}
                      className="flex w-full items-center gap-3 p-3 text-left disabled:cursor-default"
                    >
                      <span className="w-24 shrink-0 truncate text-sm font-medium text-textPrimary">{group.name}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                        <span
                          className="block h-full rounded-full bg-primary"
                          style={{ width: `${(group.sets / maxSets) * 100}%` }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right text-sm font-semibold text-textPrimary">
                        {group.sets}
                      </span>
                      <span className={`w-12 shrink-0 text-right text-xs font-semibold ${changeColor(group.change)}`}>
                        {formatWeekChange(group.change)}
                      </span>
                      {group.exercises.length > 0 && (
                        <ChevronDown
                          size={16}
                          className={`shrink-0 text-textSecondary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      )}
                    </button>
                    {isExpanded && group.exercises.length > 0 && (
                      <ul className="flex flex-col gap-1 border-t border-border px-3 py-2">
                        {group.exercises.map((exercise) => (
                          <li
                            key={exercise.exerciseId}
                            className="flex items-center justify-between text-xs text-textSecondary"
                          >
                            <span className="truncate">{exercise.name}</span>
                            <span className="shrink-0 font-medium text-textPrimary">{exercise.sets} series</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}

          {data.unassignedSets > 0 && (
            <p className="mt-3 text-xs text-textSecondary">
              {data.unassignedSets} series de ejercicios fuera del catálogo actual no entran en el total.
            </p>
          )}
        </>
      )}
    </div>
  )
}

export function isTodayInCurrentWeekOf(weekStart: string): boolean {
  const today = todayKey()
  return today >= weekStart
}
