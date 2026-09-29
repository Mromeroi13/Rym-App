// =========================================================================
// Métricas derivadas — ÚNICA implementación (docs/METRICS.md v1.1)
//
// Funciones puras: sin acceso a red, a Supabase ni al DOM. Home, Calendario,
// Progreso y el resumen del entrenamiento importan de aquí; ninguna pantalla
// recalcula estas reglas por su cuenta (ARCHITECTURE.md §2).
//
// Reglas comunes (METRICS.md §1-2):
//  - Solo cuentan entrenamientos `completed` y series con `completed_at`.
//  - Se usan valores REALES (actual_*). Los planificados solo alimentan el
//    "volumen planificado" del calendario.
//  - Un ejercicio se identifica por `exercise_id`, nunca por su nombre.
//  - Fechas en hora local; la fecha de sesión es la fecha local de `started_at`;
//    la semana va de lunes a domingo.
// =========================================================================

import type { WorkoutStatus } from '@/types/database.types'
import { addDaysKey, parseDateKey, toDateKey } from '@/utils/dates'

// -------------------------------------------------------------------------
// Tipos de entrada (estructurales: los tipos de Supabase encajan sin mapear)
// -------------------------------------------------------------------------

export interface PlannedSet {
  planned_weight_kg: number | null
  planned_reps: number | null
}

export interface MetricSet extends PlannedSet {
  set_number: number
  actual_weight_kg: number | null
  actual_reps: number | null
  completed_at: string | null
}

export interface MetricWorkoutExercise {
  exercise_id: string
  exercise_name_snapshot: string
  workout_sets: readonly MetricSet[]
}

export interface MetricWorkout {
  id: string
  status: WorkoutStatus
  started_at: string
  scheduled_date: string | null
  routines?: { name: string } | null
  workout_exercises: readonly MetricWorkoutExercise[]
}

export interface MetricRoutine {
  name: string
  routine_exercises: readonly { routine_sets: readonly PlannedSet[] }[]
}

export interface CatalogMuscleGroup {
  id: string
  name: string
}

export interface CatalogExercise {
  id: string
  name: string
  muscle_group_id: string
}

// -------------------------------------------------------------------------
// Utilidades numéricas y de fechas
// -------------------------------------------------------------------------

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

/** Fecha de sesión: fecha LOCAL (YYYY-MM-DD) de `started_at` (METRICS.md §2). */
export function sessionDateKey(startedAt: string): string {
  return toDateKey(new Date(startedAt))
}

/** Lunes (YYYY-MM-DD) de la semana que contiene la fecha dada. */
export function weekStartKey(dateKey: string): string {
  const offset = (parseDateKey(dateKey).getDay() + 6) % 7
  return addDaysKey(dateKey, -offset)
}

/** Domingo (YYYY-MM-DD) de la semana que empieza en `weekStart`. */
export function weekEndKey(weekStart: string): string {
  return addDaysKey(weekStartKey(weekStart), 6)
}

/** Primer y último día del mes (`month` es 0-11, como en Date). */
export function monthRangeKeys(year: number, month: number): { start: string; end: string } {
  return {
    start: toDateKey(new Date(year, month, 1)),
    end: toDateKey(new Date(year, month + 1, 0)),
  }
}

/** Resta meses naturales a una fecha, ajustando al último día si el mes destino es más corto. */
export function addMonthsKey(dateKey: string, months: number): string {
  const base = parseDateKey(dateKey)
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1)
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()
  target.setDate(Math.min(base.getDate(), lastDay))
  return toDateKey(target)
}

function startedMs(workout: { started_at: string }): number {
  return Date.parse(workout.started_at)
}

// -------------------------------------------------------------------------
// §1 Alcance de datos y §3 Cantidades básicas
// -------------------------------------------------------------------------

export function isPerformedSet(set: Pick<MetricSet, 'completed_at'>): boolean {
  return Boolean(set.completed_at)
}

export function isCompleted(workout: Pick<MetricWorkout, 'status'>): boolean {
  return workout.status === 'completed'
}

export function completedWorkouts<T extends Pick<MetricWorkout, 'status'>>(workouts: readonly T[]): T[] {
  return workouts.filter(isCompleted)
}

/** Volumen de una serie: peso real × repeticiones reales. Sin peso aporta 0. */
export function setVolumeKg(set: Pick<MetricSet, 'actual_weight_kg' | 'actual_reps'>): number {
  return (set.actual_weight_kg ?? 0) * (set.actual_reps ?? 0)
}

/** Volumen (kg) de un conjunto de series: solo cuentan las series realizadas. */
export function volumeKg(sets: readonly MetricSet[]): number {
  return roundTo(sets.filter(isPerformedSet).reduce((sum, s) => sum + setVolumeKg(s), 0), 2)
}

/** Volumen planificado (kg): peso × repeticiones planificados; los valores ausentes aportan 0. */
export function plannedVolumeKg(sets: readonly PlannedSet[]): number {
  return roundTo(sets.reduce((sum, s) => sum + (s.planned_weight_kg ?? 0) * (s.planned_reps ?? 0), 0), 2)
}

export interface WorkoutStats {
  exercises: number
  totalSets: number
  performedSets: number
  volumeKg: number
}

/**
 * Cifras de UN entrenamiento (resumen y detalle del calendario). No filtra por
 * estado: quien llama decide qué entrenamientos mostrar.
 */
export function workoutStats(workout: Pick<MetricWorkout, 'workout_exercises'>): WorkoutStats {
  const all = workout.workout_exercises.flatMap((e) => e.workout_sets)
  return {
    exercises: workout.workout_exercises.length,
    totalSets: all.length,
    performedSets: all.filter(isPerformedSet).length,
    volumeKg: volumeKg(all),
  }
}

export interface PeriodTotals {
  workouts: number
  setsPerformed: number
  volumeKg: number
}

/**
 * Totales de un periodo. Recibe los entrenamientos ya acotados al periodo
 * (el llamador pide el rango a la base de datos) y descarta los que no estén
 * completados. Dos entrenamientos el mismo día cuentan como dos.
 */
export function summarizeWorkouts(workouts: readonly MetricWorkout[]): PeriodTotals {
  const done = completedWorkouts(workouts)
  const stats = done.map(workoutStats)
  return {
    workouts: done.length,
    setsPerformed: stats.reduce((sum, s) => sum + s.performedSets, 0),
    volumeKg: roundTo(stats.reduce((sum, s) => sum + s.volumeKg, 0), 2),
  }
}

/** Datos de una rutina para el detalle del calendario. */
export function routineTotals(routine: MetricRoutine): { exercises: number; totalSets: number; plannedVolumeKg: number } {
  const sets = routine.routine_exercises.flatMap((e) => e.routine_sets)
  return {
    exercises: routine.routine_exercises.length,
    totalSets: sets.length,
    plannedVolumeKg: plannedVolumeKg(sets),
  }
}

// -------------------------------------------------------------------------
// §4 Progresión de peso por ejercicio
// -------------------------------------------------------------------------

export interface ProgressionSet {
  weightKg: number | null
  reps: number | null
}

export interface ProgressionPoint {
  workoutId: string
  /** Fecha de sesión (YYYY-MM-DD, hora local). Eje X. */
  date: string
  startedAtMs: number
  exerciseName: string
  /** Peso máximo de la sesión entre las series realizadas con peso > 0. Eje Y. */
  topWeightKg: number
  /** Series realizadas de ese ejercicio en ese entrenamiento (para el tooltip). */
  sets: ProgressionSet[]
}

/** Mayor peso real entre las series realizadas con peso > 0; null si no hay ninguna. */
export function topWeightOfSets(sets: readonly MetricSet[]): number | null {
  let top: number | null = null
  for (const set of sets) {
    const weight = set.actual_weight_kg
    if (isPerformedSet(set) && weight !== null && weight > 0 && (top === null || weight > top)) top = weight
  }
  return top
}

/**
 * Un punto por (entrenamiento completado, ejercicio) que tenga al menos una serie
 * realizada con peso. Si un mismo ejercicio aparece dos veces en un entrenamiento,
 * sus series se fusionan en un único punto.
 */
function collectExercisePoints(workouts: readonly MetricWorkout[]): Map<string, ProgressionPoint[]> {
  const byExercise = new Map<string, ProgressionPoint[]>()

  for (const workout of completedWorkouts(workouts)) {
    const setsByExercise = new Map<string, { name: string; sets: MetricSet[] }>()
    for (const we of workout.workout_exercises) {
      const entry = setsByExercise.get(we.exercise_id) ?? { name: we.exercise_name_snapshot, sets: [] }
      entry.sets.push(...we.workout_sets.filter(isPerformedSet))
      setsByExercise.set(we.exercise_id, entry)
    }

    for (const [exerciseId, { name, sets }] of setsByExercise) {
      const top = topWeightOfSets(sets)
      if (top === null) continue
      const point: ProgressionPoint = {
        workoutId: workout.id,
        date: sessionDateKey(workout.started_at),
        startedAtMs: startedMs(workout),
        exerciseName: name,
        topWeightKg: top,
        sets: [...sets]
          .sort((a, b) => a.set_number - b.set_number)
          .map((s) => ({ weightKg: s.actual_weight_kg, reps: s.actual_reps })),
      }
      const list = byExercise.get(exerciseId)
      if (list) list.push(point)
      else byExercise.set(exerciseId, [point])
    }
  }

  for (const list of byExercise.values()) list.sort((a, b) => a.startedAtMs - b.startedAtMs)
  return byExercise
}

/** Puntos de la gráfica de progresión de un ejercicio, ordenados por fecha. */
export function exerciseProgression(workouts: readonly MetricWorkout[], exerciseId: string): ProgressionPoint[] {
  return collectExercisePoints(workouts).get(exerciseId) ?? []
}

export type ProgressionRange = '1m' | '3m' | '6m' | 'all'

const RANGE_MONTHS: Record<Exclude<ProgressionRange, 'all'>, number> = { '1m': 1, '3m': 3, '6m': 6 }

/** Filtra los puntos al rango elegido (1 mes, 3 meses, 6 meses, Todo) contando hasta `today`. */
export function filterProgressionByRange(
  points: readonly ProgressionPoint[],
  range: ProgressionRange,
  today: string,
): ProgressionPoint[] {
  if (range === 'all') return [...points]
  const from = addMonthsKey(today, -RANGE_MONTHS[range])
  return points.filter((p) => p.date >= from)
}

export interface ProgressionSummary {
  firstKg: number
  currentKg: number
  bestKg: number
  changeKg: number
}

/** Resumen de la gráfica: primer peso, peso actual, mejor peso y cambio total. */
export function progressionSummary(points: readonly ProgressionPoint[]): ProgressionSummary | null {
  if (points.length === 0) return null
  const first = points[0].topWeightKg
  const current = points[points.length - 1].topWeightKg
  return {
    firstKg: first,
    currentKg: current,
    bestKg: Math.max(...points.map((p) => p.topWeightKg)),
    changeKg: roundTo(current - first, 2),
  }
}

// -------------------------------------------------------------------------
// §5 Ejercicios con más peso (Home)
// -------------------------------------------------------------------------

export interface IncreasedWeightExercise {
  exerciseId: string
  name: string
  monthMax: number
  reference: number
  gainKg: number
}

/**
 * Ejercicios que levantaron más peso en el mes (`month` es 0-11).
 *
 *  - monthMax  = mayor peso máximo entre sus entrenamientos completados del mes.
 *  - reference = peso máximo de su entrenamiento completado más reciente ANTES del
 *                mes; si no hay, el de su primer entrenamiento completado DEL mes.
 *  - cuenta si monthMax > reference; la ganancia es monthMax − reference.
 *
 * El llamador debe incluir el último entrenamiento previo al mes de cada ejercicio
 * (no basta con cargar solo el mes visible).
 */
export function increasedWeightExercises(
  workouts: readonly MetricWorkout[],
  year: number,
  month: number,
): IncreasedWeightExercise[] {
  const { start, end } = monthRangeKeys(year, month)
  const result: IncreasedWeightExercise[] = []

  for (const [exerciseId, points] of collectExercisePoints(workouts)) {
    const inMonth = points.filter((p) => p.date >= start && p.date <= end)
    if (inMonth.length === 0) continue

    const before = points.filter((p) => p.date < start)
    const reference = before.length > 0 ? before[before.length - 1].topWeightKg : inMonth[0].topWeightKg
    const monthMax = Math.max(...inMonth.map((p) => p.topWeightKg))
    if (monthMax <= reference) continue

    result.push({
      exerciseId,
      name: inMonth[inMonth.length - 1].exerciseName,
      monthMax,
      reference,
      gainKg: roundTo(monthMax - reference, 2),
    })
  }

  return result.sort((a, b) => b.gainKg - a.gainKg || a.name.localeCompare(b.name, 'es'))
}

// -------------------------------------------------------------------------
// §6 Series por grupo muscular y semana
// -------------------------------------------------------------------------

export interface WeeklyExerciseSets {
  exerciseId: string
  name: string
  sets: number
}

export interface WeeklyMuscleGroupSets {
  muscleGroupId: string
  name: string
  sets: number
  previousSets: number
  /** sets(semana) − sets(semana anterior). */
  change: number
  /** Ejercicios que aportaron series esta semana, de más a menos. */
  exercises: WeeklyExerciseSets[]
}

export interface WeeklySets {
  weekStart: string
  weekEnd: string
  /** Todos los grupos del catálogo, en el orden recibido, incluidos los de 0 series. */
  groups: WeeklyMuscleGroupSets[]
  total: number
  previousTotal: number
  change: number
  /** Series de ejercicios que no están en el catálogo recibido (no entran en el total). */
  unassignedSets: number
}

/**
 * Series realizadas por grupo muscular en la semana que contiene `weekStart`, con el
 * cambio respecto a la semana anterior. El grupo se lee del ejercicio ACTUAL del
 * catálogo: pasar TODOS los ejercicios, también los inactivos, o sus series históricas
 * quedarán en `unassignedSets`.
 */
export function weeklySetsByMuscleGroup(
  workouts: readonly MetricWorkout[],
  exercises: readonly CatalogExercise[],
  muscleGroups: readonly CatalogMuscleGroup[],
  weekStart: string,
): WeeklySets {
  const start = weekStartKey(weekStart)
  const end = weekEndKey(start)
  const previousStart = addDaysKey(start, -7)
  const previousEnd = addDaysKey(start, -1)
  const catalog = new Map(exercises.map((e) => [e.id, e]))

  function countWeek(from: string, to: string) {
    const byExercise = new Map<string, number>()
    for (const workout of completedWorkouts(workouts)) {
      const date = sessionDateKey(workout.started_at)
      if (date < from || date > to) continue
      for (const we of workout.workout_exercises) {
        const performed = we.workout_sets.filter(isPerformedSet).length
        if (performed > 0) byExercise.set(we.exercise_id, (byExercise.get(we.exercise_id) ?? 0) + performed)
      }
    }

    const byGroup = new Map<string, { sets: number; exercises: WeeklyExerciseSets[] }>()
    let unassigned = 0
    for (const [exerciseId, sets] of byExercise) {
      const exercise = catalog.get(exerciseId)
      if (!exercise) {
        unassigned += sets
        continue
      }
      const entry = byGroup.get(exercise.muscle_group_id) ?? { sets: 0, exercises: [] }
      entry.sets += sets
      entry.exercises.push({ exerciseId, name: exercise.name, sets })
      byGroup.set(exercise.muscle_group_id, entry)
    }
    return { byGroup, unassigned }
  }

  const current = countWeek(start, end)
  const previous = countWeek(previousStart, previousEnd)

  const groups: WeeklyMuscleGroupSets[] = muscleGroups.map((group) => {
    const now = current.byGroup.get(group.id)
    const sets = now?.sets ?? 0
    const previousSets = previous.byGroup.get(group.id)?.sets ?? 0
    return {
      muscleGroupId: group.id,
      name: group.name,
      sets,
      previousSets,
      change: sets - previousSets,
      exercises: [...(now?.exercises ?? [])].sort((a, b) => b.sets - a.sets || a.name.localeCompare(b.name, 'es')),
    }
  })

  const total = groups.reduce((sum, g) => sum + g.sets, 0)
  const previousTotal = groups.reduce((sum, g) => sum + g.previousSets, 0)

  return {
    weekStart: start,
    weekEnd: end,
    groups,
    total,
    previousTotal,
    change: total - previousTotal,
    unassignedSets: current.unassigned,
  }
}

// -------------------------------------------------------------------------
// §7 Estado de cada día del calendario
// -------------------------------------------------------------------------

export type CalendarDayStatus = 'completed' | 'scheduled' | 'not_trained'

export const CALENDAR_STATUS_LABEL: Record<CalendarDayStatus, string> = {
  completed: 'Completado',
  scheduled: 'Programado',
  not_trained: 'Sin entrenar',
}

/** Fecha que cumple un entrenamiento: `scheduled_date` si existe; si no, su fecha de sesión. */
export function fulfilledDateKey(workout: Pick<MetricWorkout, 'scheduled_date' | 'started_at'>): string {
  return workout.scheduled_date ?? sessionDateKey(workout.started_at)
}

/** S(D): entrenamientos COMPLETADOS que cumplen la fecha D. */
export function workoutsFulfillingDate<T extends MetricWorkout>(workouts: readonly T[], dateKey: string): T[] {
  return completedWorkouts(workouts)
    .filter((w) => fulfilledDateKey(w) === dateKey)
    .sort((a, b) => startedMs(a) - startedMs(b))
}

/**
 * Estado de una fecha. Devuelve null cuando no hay marcador (sin asignación y sin
 * entrenamiento completado). El estado nunca se almacena: se recalcula siempre.
 */
export function calendarDayStatus(input: {
  dateKey: string
  hasAssignment: boolean
  fulfillingWorkouts: number
  todayKey: string
}): CalendarDayStatus | null {
  if (input.fulfillingWorkouts > 0) return 'completed'
  if (!input.hasAssignment) return null
  return input.dateKey >= input.todayKey ? 'scheduled' : 'not_trained'
}

/**
 * Estado de todas las fechas con marcador para las asignaciones y entrenamientos
 * recibidos. Las fechas ausentes del mapa no tienen marcador.
 */
export function buildCalendarStatuses(
  assignments: readonly { scheduled_date: string }[],
  workouts: readonly MetricWorkout[],
  todayKey: string,
): Map<string, CalendarDayStatus> {
  const fulfilled = new Map<string, number>()
  for (const workout of completedWorkouts(workouts)) {
    const key = fulfilledDateKey(workout)
    fulfilled.set(key, (fulfilled.get(key) ?? 0) + 1)
  }
  const assigned = new Set(assignments.map((a) => a.scheduled_date))

  const statuses = new Map<string, CalendarDayStatus>()
  for (const dateKey of new Set([...fulfilled.keys(), ...assigned])) {
    const status = calendarDayStatus({
      dateKey,
      hasAssignment: assigned.has(dateKey),
      fulfillingWorkouts: fulfilled.get(dateKey) ?? 0,
      todayKey,
    })
    if (status) statuses.set(dateKey, status)
  }
  return statuses
}

// -------------------------------------------------------------------------
// §8 Detalle del día
// -------------------------------------------------------------------------

export const DEFAULT_WORKOUT_NAME = 'Entrenamiento'

export interface CompletedDayBlock {
  kind: 'completed'
  workoutId: string
  routineName: string
  exercises: number
  setsPerformed: number
  totalSets: number
  volumeKg: number
}

export interface PlannedDayBlock {
  kind: 'planned'
  status: 'scheduled' | 'not_trained'
  routineName: string
  exercises: number
  totalSets: number
  /** Se muestra con la etiqueta "Volumen planificado". */
  plannedVolumeKg: number
}

export type CalendarDayBlock = CompletedDayBlock | PlannedDayBlock

export interface CalendarDayDetail {
  dateKey: string
  status: CalendarDayStatus
  blocks: CalendarDayBlock[]
}

/**
 * Detalle de la fecha seleccionada. Si varios entrenamientos completados cumplen la
 * fecha, cada uno es su propio bloque. Devuelve null si la fecha no tiene marcador.
 */
export function calendarDayDetail(input: {
  dateKey: string
  assignedRoutine: MetricRoutine | null
  workouts: readonly MetricWorkout[]
  todayKey: string
}): CalendarDayDetail | null {
  const fulfilling = workoutsFulfillingDate(input.workouts, input.dateKey)
  const status = calendarDayStatus({
    dateKey: input.dateKey,
    hasAssignment: input.assignedRoutine !== null,
    fulfillingWorkouts: fulfilling.length,
    todayKey: input.todayKey,
  })
  if (!status) return null

  if (status === 'completed') {
    return {
      dateKey: input.dateKey,
      status,
      blocks: fulfilling.map((workout) => {
        const stats = workoutStats(workout)
        return {
          kind: 'completed',
          workoutId: workout.id,
          routineName: workout.routines?.name ?? DEFAULT_WORKOUT_NAME,
          exercises: stats.exercises,
          setsPerformed: stats.performedSets,
          totalSets: stats.totalSets,
          volumeKg: stats.volumeKg,
        }
      }),
    }
  }

  // status es 'scheduled' | 'not_trained' ⇒ hay asignación.
  const routine = input.assignedRoutine as MetricRoutine
  return {
    dateKey: input.dateKey,
    status,
    blocks: [{ kind: 'planned', status, routineName: routine.name, ...routineTotals(routine) }],
  }
}

// -------------------------------------------------------------------------
// Formato de presentación (es-ES): definido aquí para que todas las pantallas
// muestren igual los mismos números. Implementación manual (sin Intl) porque
// es-ES no agrupa los miles de 4 cifras por defecto y el ejemplo de METRICS.md
// exige `1.305 kg`.
// -------------------------------------------------------------------------

function formatEs(value: number, maxDecimals: number): string {
  const rounded = roundTo(Math.abs(value), maxDecimals)
  const [integer, fraction] = rounded.toFixed(maxDecimals).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const decimals = fraction ? fraction.replace(/0+$/, '') : ''
  const text = decimals ? `${grouped},${decimals}` : grouped
  return value < 0 && rounded !== 0 ? `−${text}` : text
}

/** Peso: `60 kg`, `57,5 kg`. */
export function formatKg(value: number): string {
  return `${formatEs(value, 2)} kg`
}

/** Volumen: como máximo un decimal y separador de miles: `12.450 kg`. */
export function formatVolumeKg(value: number): string {
  return `${formatEs(value, 1)} kg`
}

/** Ganancia o cambio con signo explícito: `+2,5 kg`, `−5 kg`, `0 kg`. */
export function formatSignedKg(value: number): string {
  const text = formatKg(value)
  return value > 0 ? `+${text}` : text
}

/** Serie del tooltip: `60 kg × 8`; sin peso, `12 reps`. */
export function formatProgressionSet(set: ProgressionSet): string {
  if (set.reps === null) return set.weightKg !== null && set.weightKg > 0 ? formatKg(set.weightKg) : '—'
  return set.weightKg !== null && set.weightKg > 0 ? `${formatKg(set.weightKg)} × ${set.reps}` : `${set.reps} reps`
}

/** Tooltip de un punto: `60 kg × 8 · 60 kg × 8 · 57,5 kg × 6`. */
export function formatProgressionTooltip(point: ProgressionPoint): string {
  return point.sets.map(formatProgressionSet).join(' · ')
}

/** Series del detalle de un día completado: `14 de 16 series`. */
export function formatSetsProgress(performed: number, total: number): string {
  return `${performed} de ${total} ${total === 1 ? 'serie' : 'series'}`
}

/** Cambio semanal: `+3`, `−2` o `=`. */
export function formatWeekChange(change: number): string {
  if (change > 0) return `+${change}`
  if (change < 0) return `−${Math.abs(change)}`
  return '='
}
