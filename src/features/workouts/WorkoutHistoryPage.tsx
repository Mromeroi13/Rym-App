import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { fetchHistory } from './workoutApi'
import type { WorkoutListItem } from './workoutTypes'
import { formatDuration } from './timer'

export function WorkoutHistoryPage() {
  const [items, setItems] = useState<WorkoutListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setItems(await fetchHistory())
    } catch {
      setError('No se pudo cargar tu historial.')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Historial de entrenamientos</h1>
        <p className="mt-1 text-sm text-textSecondary">Tus sesiones completadas y abandonadas, con lo que realmente hiciste.</p>
      </div>

      {loading && <p className="text-sm text-textSecondary">Cargando historial...</p>}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          <span>{error}</span>
          <button type="button" onClick={load} className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10">
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-textSecondary">Todavía no has terminado ningún entrenamiento.</p>
          <Link to="/rutinas" className="mt-3 inline-block text-sm font-semibold text-primary">
            Ir a Rutinas
          </Link>
        </div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const allSets = item.workout_exercises.flatMap((e) => e.workout_sets)
            const done = allSets.filter((s) => s.completed_at).length
            const date = new Date(item.started_at).toLocaleDateString('es-ES', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const abandoned = item.status === 'abandoned'
            return (
              <Link
                key={item.id}
                to={`/entrenamiento/${item.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textPrimary">{item.routines?.name ?? 'Entrenamiento'}</p>
                  <p className="mt-0.5 text-xs capitalize text-textSecondary">
                    {date} · {done}/{allSets.length} series
                    {item.timer_enabled && <> · {formatDuration(item.elapsed_seconds)}</>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      abandoned ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
                    }`}
                  >
                    {abandoned ? 'Abandonado' : 'Completado'}
                  </span>
                  <ChevronRight size={16} className="text-textSecondary" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
