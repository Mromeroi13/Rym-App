import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, ChevronRight, ClipboardList, Play, Repeat, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { buildMonthGrid, formatLongDate, todayKey, toDateKey } from '@/utils/dates'
import { useRoutines } from '@/features/routines/hooks/useRoutines'
import { AssignRoutineDialog } from '@/features/routines/components/AssignRoutineDialog'
import { OpenWorkoutBanner } from '@/features/workouts/components/OpenWorkoutBanner'
import {
  CALENDAR_STATUS_LABEL,
  buildCalendarStatuses,
  calendarDayDetail,
  formatSetsProgress,
  formatVolumeKg,
  type CalendarDayStatus,
} from '@/features/progress/metrics'
import { useAssignments } from './hooks/useAssignments'
import { useCalendarWorkouts } from './hooks/useCalendarWorkouts'

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

// Colores del marcador de estado (CAL-05). El estado también se muestra siempre como
// texto (título del día, leyenda y detalle): el color nunca es la única señal.
const STATUS_DOT_CLASS: Record<CalendarDayStatus, string> = {
  scheduled: 'bg-primary',
  completed: 'bg-success',
  not_trained: 'bg-warning',
}

const LEGEND_ITEMS: CalendarDayStatus[] = ['scheduled', 'completed', 'not_trained']

export function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [assigning, setAssigning] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month])
  const rangeStart = toDateKey(grid[0])
  const rangeEnd = toDateKey(grid[grid.length - 1])

  const { assignments, loading: assignmentsLoading, error: assignmentsError, refresh } = useAssignments(rangeStart, rangeEnd)
  const {
    workouts: calendarWorkouts,
    loading: workoutsLoading,
    error: workoutsError,
    refresh: refreshWorkouts,
  } = useCalendarWorkouts(rangeStart, rangeEnd)
  const { routines } = useRoutines()

  const loading = assignmentsLoading || workoutsLoading
  const error = assignmentsError ?? workoutsError

  function retry() {
    if (assignmentsError) refresh()
    if (workoutsError) refreshWorkouts()
  }

  const assignmentByDate = useMemo(() => {
    const map = new Map<string, (typeof assignments)[number]>()
    assignments.forEach((a) => map.set(a.scheduled_date, a))
    return map
  }, [assignments])

  const today = todayKey()
  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

  // Estado de cada fecha con marcador (METRICS.md §7). Nunca se almacena: se recalcula
  // siempre a partir de las asignaciones y los entrenamientos completados visibles.
  const statusByDate = useMemo(
    () => buildCalendarStatuses(assignments, calendarWorkouts, today),
    [assignments, calendarWorkouts, today],
  )

  const selectedAssignment = assignmentByDate.get(selectedDate) ?? null
  const selectedRoutine = selectedAssignment
    ? routines.find((r) => r.id === selectedAssignment.routine_id) ?? null
    : null
  const selectedStatus = statusByDate.get(selectedDate) ?? null

  // Detalle de la fecha seleccionada (METRICS.md §8): un bloque por entrenamiento
  // completado que la cumple, o un único bloque planificado.
  const selectedDetail = useMemo(
    () =>
      calendarDayDetail({
        dateKey: selectedDate,
        assignedRoutine: selectedRoutine,
        workouts: calendarWorkouts,
        todayKey: today,
      }),
    [selectedDate, selectedRoutine, calendarWorkouts, today],
  )

  function shiftMonth(delta: number) {
    const d = new Date(year, month + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth())
  }

  function goToToday() {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth())
    setSelectedDate(todayKey())
  }

  async function removeAssignment() {
    if (!selectedAssignment) return
    setActionError(null)
    setRemoving(true)
    const { error: deleteError } = await supabase
      .from('routine_assignments')
      .delete()
      .eq('id', selectedAssignment.id)
    setRemoving(false)
    if (deleteError) {
      setActionError('No se pudo quitar la rutina de esta fecha.')
      return
    }
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Calendario</h1>
        <p className="mt-1 text-sm text-textSecondary">Consulta y planifica qué rutina entrenas cada día.</p>
      </div>

      <OpenWorkoutBanner />

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          <span>{error}</span>
          <button
            type="button"
            onClick={retry}
            className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-xl border border-border bg-surface p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold capitalize text-textPrimary">{monthLabel}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goToToday}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(-1)}
                aria-label="Mes anterior"
                className="rounded-lg p-2 text-textSecondary hover:bg-background"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => shiftMonth(1)}
                aria-label="Mes siguiente"
                className="rounded-lg p-2 text-textSecondary hover:bg-background"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-textSecondary">
            {WEEKDAYS.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          <div className={`mt-1 grid grid-cols-7 gap-1 ${loading ? 'opacity-60' : ''}`}>
            {grid.map((date) => {
              const key = toDateKey(date)
              const inMonth = date.getMonth() === month
              const assignment = assignmentByDate.get(key)
              const status = statusByDate.get(key) ?? null
              const isSelected = key === selectedDate
              const isToday = key === today
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedDate(key)}
                  title={status ? CALENDAR_STATUS_LABEL[status] : undefined}
                  aria-label={`${date.getDate()} de ${monthLabel}${status ? `, ${CALENDAR_STATUS_LABEL[status]}` : ''}`}
                  className={`flex min-h-[3.5rem] flex-col items-center gap-1 rounded-xl border p-1.5 text-sm transition-colors sm:min-h-[4.5rem] ${
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:bg-background'
                  } ${inMonth ? 'text-textPrimary' : 'text-textSecondary/50'}`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isToday ? 'bg-primary text-white' : ''
                    }`}
                  >
                    {date.getDate()}
                  </span>
                  {status && (
                    <>
                      <span className={`h-1.5 w-1.5 rounded-full sm:hidden ${STATUS_DOT_CLASS[status]}`} />
                      <span className="hidden w-full items-center gap-1 truncate rounded bg-background px-1 py-0.5 text-[10px] font-medium sm:flex">
                        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT_CLASS[status]}`} />
                        <span className="truncate">{assignment?.routines?.name ?? CALENDAR_STATUS_LABEL[status]}</span>
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3">
            {LEGEND_ITEMS.map((status) => (
              <span key={status} className="inline-flex items-center gap-1.5 text-xs text-textSecondary">
                <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[status]}`} />
                {CALENDAR_STATUS_LABEL[status]}
              </span>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-xl border border-border bg-surface p-5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
            Fecha seleccionada
          </span>
          <h3 className="mt-1 font-heading text-base font-bold capitalize text-textPrimary">
            {formatLongDate(selectedDate)}
          </h3>
          {selectedStatus && (
            <span className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-textSecondary">
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT_CLASS[selectedStatus]}`} />
              {CALENDAR_STATUS_LABEL[selectedStatus]}
            </span>
          )}

          {actionError && <p className="mt-3 text-sm text-critical">{actionError}</p>}

          {selectedDetail && selectedDetail.blocks.length > 0 ? (
            <div className="mt-4 flex flex-col gap-3">
              {selectedDetail.blocks.map((block, index) =>
                block.kind === 'completed' ? (
                  <div key={block.workoutId} className="rounded-xl bg-background p-3">
                    <p className="text-sm font-semibold text-textPrimary">{block.routineName}</p>
                    <p className="mt-1 text-xs text-textSecondary">
                      {block.exercises} ejercicios · {formatSetsProgress(block.setsPerformed, block.totalSets)}
                    </p>
                    <p className="mt-1 text-xs text-textSecondary">Volumen: {formatVolumeKg(block.volumeKg)}</p>
                    <Link
                      to={`/entrenamiento/${block.workoutId}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <ClipboardList size={14} /> Abrir resumen
                    </Link>
                  </div>
                ) : (
                  <div key={`planned-${index}`} className="rounded-xl bg-background p-3">
                    <p className="text-sm font-semibold text-textPrimary">{block.routineName}</p>
                    {selectedRoutine && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-textSecondary">
                        <Repeat size={12} /> {block.exercises} ejercicios · {block.totalSets} series
                      </p>
                    )}
                    <p className="mt-1 text-xs text-textSecondary">
                      Volumen planificado: {formatVolumeKg(block.plannedVolumeKg)}
                    </p>
                  </div>
                ),
              )}

              {selectedRoutine && selectedRoutine.routine_exercises.length > 0 && selectedStatus !== 'completed' && (
                <ol className="flex flex-col gap-1.5">
                  {selectedRoutine.routine_exercises.map((re, index) => (
                    <li key={re.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="text-xs text-textSecondary">{index + 1}</span>
                        <span className="truncate text-textPrimary">{re.exercises?.name ?? 'Ejercicio'}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {/* CAL-07: acciones según el estado. Completado solo ofrece abrir el resumen. */}
              {selectedStatus !== 'completed' && selectedRoutine && (
                <>
                  <Link
                    to={`/entrenamiento/iniciar/${selectedRoutine.id}?fecha=${selectedDate}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                  >
                    <Play size={16} />
                    Iniciar entrenamiento
                  </Link>

                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAssigning(true)}
                      className="flex-1 rounded-xl bg-background px-3 py-2.5 text-sm font-semibold text-textPrimary hover:bg-border/60"
                    >
                      Cambiar rutina
                    </button>
                    <button
                      type="button"
                      onClick={removeAssignment}
                      disabled={removing}
                      title="Quitar de esta fecha"
                      className="rounded-xl bg-background p-2.5 text-textSecondary hover:bg-critical/10 hover:text-critical disabled:opacity-60"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-3">
              <p className="rounded-xl bg-background p-3 text-sm text-textSecondary">
                No hay ninguna rutina asignada a esta fecha.
              </p>
              {routines.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setAssigning(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                  <CalendarPlus size={16} />
                  Asignar rutina
                </button>
              ) : (
                <Link to="/rutinas/nueva" className="text-sm font-semibold text-primary">
                  Crea tu primera rutina para poder asignarla
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {assigning && (
        <AssignRoutineDialog
          routines={routines}
          fixedDate={selectedDate}
          onClose={() => setAssigning(false)}
          onAssigned={refresh}
        />
      )}
    </div>
  )
}
