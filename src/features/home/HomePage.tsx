import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ChevronRight, Play, Repeat, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useAssignments } from '@/features/calendar/hooks/useAssignments'
import { useRoutines } from '@/features/routines/hooks/useRoutines'
import { countSets, summarizeSets } from '@/features/routines/utils'
import { OpenWorkoutBanner } from '@/features/workouts/components/OpenWorkoutBanner'
import { fetchHistory } from '@/features/workouts/workoutApi'
import { formatDuration } from '@/features/workouts/timer'
import type { WorkoutListItem } from '@/features/workouts/workoutTypes'
import { useMeals } from '@/features/meals/hooks/useMeals'
import { MEAL_SLOT_COUNT, countLogged } from '@/features/meals/mealSlots'
import { formatLongDate, todayKey } from '@/utils/dates'
import { useMonthlyProgress } from '@/features/progress/hooks/useMonthlyProgress'
import { MonthlyProgressCard } from './components/MonthlyProgressCard'

const MAX_VISIBLE_EXERCISES = 5
const RECENT_WORKOUTS = 3

export function HomePage() {
  const { profile } = useAuth()
  const today = todayKey()

  const assignments = useAssignments(today, today)
  const { routines, loading: routinesLoading, error: routinesError } = useRoutines()
  const meals = useMeals(today, today)
  const monthlyProgress = useMonthlyProgress()

  const [recent, setRecent] = useState<WorkoutListItem[] | null>(null)
  const [recentError, setRecentError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchHistory()
      .then((items) => {
        if (!cancelled) setRecent(items.slice(0, RECENT_WORKOUTS))
      })
      .catch(() => {
        if (!cancelled) setRecentError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const assignment = assignments.assignments.find((a) => a.scheduled_date === today) ?? null
  const routine = useMemo(
    () => (assignment ? routines.find((r) => r.id === assignment.routine_id) ?? null : null),
    [assignment, routines],
  )

  const loggedCount = countLogged(meals.meals)
  const percent = Math.round((loggedCount / MEAL_SLOT_COUNT) * 100)
  const todayLoading = assignments.loading || routinesLoading

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Hola, {profile?.username ?? 'atleta'}</h1>
        <p className="mt-1 text-sm capitalize text-textSecondary">{formatLongDate(today)}</p>
      </div>

      <OpenWorkoutBanner />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Rutina de hoy */}
        <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Asignado para hoy</span>

          {todayLoading && <p className="mt-3 text-sm text-textSecondary">Cargando tu día...</p>}

          {!todayLoading && (assignments.error || routinesError) && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
              <span>{assignments.error ?? routinesError}</span>
              <button
                type="button"
                onClick={() => assignments.refresh()}
                className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
              >
                Reintentar
              </button>
            </div>
          )}

          {!todayLoading && !assignments.error && !routinesError && !assignment && (
            <div className="mt-3 rounded-xl bg-background p-5 text-center">
              <p className="text-sm text-textPrimary">No tienes ninguna rutina asignada para hoy.</p>
              <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
                <Link
                  to="/calendario"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                  <CalendarDays size={16} /> Ir al calendario
                </Link>
                <Link to="/rutinas" className="text-sm font-semibold text-primary hover:underline">
                  Ver mis rutinas
                </Link>
              </div>
            </div>
          )}

          {!todayLoading && !assignments.error && !routinesError && assignment && !routine && (
            <p className="mt-3 rounded-xl bg-background p-4 text-sm text-textSecondary">
              La rutina asignada para hoy ya no está disponible.{' '}
              <Link to="/calendario" className="font-semibold text-primary">
                Revisa tu calendario
              </Link>
              .
            </p>
          )}

          {routine && (
            <div className="mt-2">
              <h2 className="font-heading text-xl font-bold text-textPrimary">{routine.name}</h2>
              {routine.description && <p className="mt-1 text-sm text-textSecondary">{routine.description}</p>}

              <p className="mt-3 inline-flex items-center gap-2 rounded-xl bg-background px-3 py-2 text-xs text-textSecondary">
                <span className="font-semibold text-textPrimary">{routine.routine_exercises.length} ejercicios</span>
                <span className="inline-flex items-center gap-1">
                  <Repeat size={12} /> {countSets(routine)} series
                </span>
              </p>

              {routine.routine_exercises.length > 0 && (
                <ol className="mt-4 flex flex-col gap-1.5">
                  {routine.routine_exercises.slice(0, MAX_VISIBLE_EXERCISES).map((re, index) => (
                    <li key={re.id} className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-xs text-textSecondary">{index + 1}</span>
                        <span className="truncate text-textPrimary">{re.exercises?.name ?? 'Ejercicio'}</span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-textSecondary">{summarizeSets(re.routine_sets)}</span>
                    </li>
                  ))}
                  {routine.routine_exercises.length > MAX_VISIBLE_EXERCISES && (
                    <li className="px-1 text-xs text-textSecondary">
                      +{routine.routine_exercises.length - MAX_VISIBLE_EXERCISES} más
                    </li>
                  )}
                </ol>
              )}

              <Link
                to={`/entrenamiento/iniciar/${routine.id}?fecha=${today}`}
                className="mt-5 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                <Play size={20} /> Iniciar entrenamiento
              </Link>
            </div>
          )}
        </div>

        <div className="flex h-fit flex-col gap-4">
          {/* Comidas de hoy */}
          <Link
            to="/comidas"
            className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary">
                <UtensilsCrossed size={16} className="text-primary" /> Comidas de hoy
              </span>
              <ChevronRight size={16} className="text-textSecondary" />
            </div>
            {meals.error ? (
              <p className="mt-3 text-sm text-critical">{meals.error}</p>
            ) : (
              <>
                <p className="mt-3 font-heading text-2xl font-bold text-textPrimary">
                  {meals.ready ? loggedCount : '—'}{' '}
                  <span className="text-sm font-normal text-textSecondary">de {MEAL_SLOT_COUNT} registradas</span>
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-background">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${meals.ready ? percent : 0}%` }} />
                </div>
              </>
            )}
          </Link>

          {/* Progreso mensual */}
          <MonthlyProgressCard
            data={monthlyProgress.data}
            loading={monthlyProgress.loading}
            error={monthlyProgress.error}
            onRetry={monthlyProgress.refresh}
          />

          {/* Últimos entrenamientos */}
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Últimos entrenamientos</span>
              <Link to="/entrenamientos" className="text-xs font-semibold text-primary hover:underline">
                Ver historial
              </Link>
            </div>

            {recentError && <p className="mt-3 text-sm text-critical">No se pudo cargar tu historial.</p>}
            {!recentError && recent === null && <p className="mt-3 text-sm text-textSecondary">Cargando...</p>}
            {!recentError && recent !== null && recent.length === 0 && (
              <p className="mt-3 text-sm text-textSecondary">Todavía no has terminado ningún entrenamiento.</p>
            )}
            {!recentError && recent !== null && recent.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {recent.map((item) => {
                  const allSets = item.workout_exercises.flatMap((e) => e.workout_sets)
                  const done = allSets.filter((s) => s.completed_at).length
                  const abandoned = item.status === 'abandoned'
                  return (
                    <li key={item.id}>
                      <Link
                        to={`/entrenamiento/${item.id}`}
                        className="flex min-h-[2.75rem] items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm hover:bg-background"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-textPrimary">{item.routines?.name ?? 'Entrenamiento'}</span>
                          <span className="block truncate text-xs text-textSecondary">
                            {new Date(item.started_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} · {done}/
                            {allSets.length} series
                            {item.timer_enabled && <> · {formatDuration(item.elapsed_seconds)}</>}
                          </span>
                        </span>
                        <span className={`shrink-0 text-xs font-semibold ${abandoned ? 'text-warning' : 'text-success'}`}>
                          {abandoned ? 'Abandonado' : 'Completado'}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
