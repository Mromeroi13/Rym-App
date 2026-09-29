import { describe, expect, it } from 'vitest'
import {
  buildCalendarStatuses,
  calendarDayDetail,
  calendarDayStatus,
  exerciseProgression,
  filterProgressionByRange,
  formatKg,
  formatProgressionTooltip,
  formatSetsProgress,
  formatSignedKg,
  formatVolumeKg,
  formatWeekChange,
  increasedWeightExercises,
  plannedVolumeKg,
  progressionSummary,
  summarizeWorkouts,
  topWeightOfSets,
  volumeKg,
  weekStartKey,
  weeklySetsByMuscleGroup,
  workoutStats,
  workoutsFulfillingDate,
  type CatalogExercise,
  type CatalogMuscleGroup,
  type MetricSet,
  type MetricWorkout,
} from './metrics'
import type { WorkoutStatus } from '@/types/database.types'

// ---- Helpers ------------------------------------------------------------
// Las fechas se construyen en hora LOCAL para que los tests no dependan de la zona horaria.

function at(year: number, month: number, day: number, hour = 10): string {
  return new Date(year, month - 1, day, hour).toISOString()
}

function done(weight: number | null, reps: number, setNumber = 1): MetricSet {
  return {
    set_number: setNumber,
    planned_weight_kg: weight,
    planned_reps: reps,
    actual_weight_kg: weight,
    actual_reps: reps,
    completed_at: '2026-01-01T10:00:00.000Z',
  }
}

function pending(weight: number | null, reps: number, setNumber = 1): MetricSet {
  return {
    set_number: setNumber,
    planned_weight_kg: weight,
    planned_reps: reps,
    actual_weight_kg: null,
    actual_reps: null,
    completed_at: null,
  }
}

function workout(
  id: string,
  startedAt: string,
  exercises: { id: string; name?: string; sets: MetricSet[] }[],
  options: { status?: WorkoutStatus; scheduledDate?: string | null; routine?: string | null } = {},
): MetricWorkout {
  return {
    id,
    status: options.status ?? 'completed',
    started_at: startedAt,
    scheduled_date: options.scheduledDate ?? null,
    routines: options.routine ? { name: options.routine } : null,
    workout_exercises: exercises.map((e) => ({
      exercise_id: e.id,
      exercise_name_snapshot: e.name ?? e.id,
      workout_sets: e.sets,
    })),
  }
}

/** Entrenamiento de un ejercicio con una única serie pesada. */
function lift(id: string, startedAt: string, exerciseId: string, weight: number, reps = 5): MetricWorkout {
  return workout(id, startedAt, [{ id: exerciseId, name: exerciseId, sets: [done(weight, reps)] }])
}

// ---- §3 Cantidades básicas ---------------------------------------------

describe('volumen y series', () => {
  it('suma peso × repeticiones de las series realizadas (ejemplo de METRICS.md §3)', () => {
    const sets = [done(60, 8, 1), done(60, 8, 2), done(57.5, 6, 3)]
    expect(volumeKg(sets)).toBe(1305)
  })

  it('una serie sin peso aporta 0 al volumen pero cuenta como serie realizada', () => {
    const w = workout('w1', at(2026, 9, 7), [{ id: 'dominadas', sets: [done(null, 10, 1), done(20, 5, 2)] }])
    expect(workoutStats(w)).toEqual({ exercises: 1, totalSets: 2, performedSets: 2, volumeKg: 100 })
  })

  it('las series sin completed_at no cuentan ni en series ni en volumen', () => {
    const w = workout('w1', at(2026, 9, 7), [{ id: 'press', sets: [done(50, 10, 1), pending(50, 10, 2)] }])
    expect(workoutStats(w)).toEqual({ exercises: 1, totalSets: 2, performedSets: 1, volumeKg: 500 })
  })

  it('el volumen usa los valores reales, no los planificados', () => {
    const set: MetricSet = { ...done(60, 8), planned_weight_kg: 100, planned_reps: 10, actual_weight_kg: 60, actual_reps: 8 }
    expect(volumeKg([set])).toBe(480)
  })

  it('volumen planificado: los valores ausentes aportan 0', () => {
    expect(
      plannedVolumeKg([
        { planned_weight_kg: 50, planned_reps: 10 },
        { planned_weight_kg: null, planned_reps: 12 },
        { planned_weight_kg: 40, planned_reps: null },
      ]),
    ).toBe(500)
  })

  it('el total del periodo ignora entrenamientos abandonados, activos y pausados', () => {
    const sets = [done(100, 10)]
    const totals = summarizeWorkouts([
      workout('c', at(2026, 9, 1), [{ id: 'a', sets }]),
      workout('x', at(2026, 9, 2), [{ id: 'a', sets }], { status: 'abandoned' }),
      workout('y', at(2026, 9, 3), [{ id: 'a', sets }], { status: 'active' }),
      workout('z', at(2026, 9, 4), [{ id: 'a', sets }], { status: 'paused' }),
    ])
    expect(totals).toEqual({ workouts: 1, setsPerformed: 1, volumeKg: 1000 })
  })

  it('dos entrenamientos el mismo día cuentan como dos', () => {
    const sets = [done(50, 10)]
    const totals = summarizeWorkouts([
      workout('a', at(2026, 9, 7, 8), [{ id: 'e', sets }]),
      workout('b', at(2026, 9, 7, 19), [{ id: 'e', sets }]),
    ])
    expect(totals.workouts).toBe(2)
    expect(totals.volumeKg).toBe(1000)
  })
})

// ---- §4 Progresión ------------------------------------------------------

describe('progresión de peso por ejercicio', () => {
  it('el peso máximo de la sesión ignora series sin realizar y series sin peso', () => {
    expect(topWeightOfSets([done(60, 8, 1), done(65, 5, 2), pending(100, 3, 3), done(null, 12, 4)])).toBe(65)
    expect(topWeightOfSets([done(null, 12), pending(80, 5, 2)])).toBeNull()
  })

  it('devuelve un punto por entrenamiento completado, ordenado por fecha', () => {
    const points = exerciseProgression(
      [lift('w2', at(2026, 9, 10), 'press', 62.5), lift('w1', at(2026, 9, 3), 'press', 60)],
      'press',
    )
    expect(points.map((p) => [p.date, p.topWeightKg])).toEqual([
      ['2026-09-03', 60],
      ['2026-09-10', 62.5],
    ])
  })

  it('un entrenamiento sin serie con peso para ese ejercicio no genera punto', () => {
    const w = workout('w1', at(2026, 9, 3), [{ id: 'press', sets: [done(null, 10), pending(60, 8, 2)] }])
    expect(exerciseProgression([w], 'press')).toEqual([])
  })

  it('identifica el ejercicio por exercise_id, no por el nombre del snapshot', () => {
    const w = workout('w1', at(2026, 9, 3), [{ id: 'press', name: 'Nombre antiguo', sets: [done(60, 8)] }])
    expect(exerciseProgression([w], 'press')).toHaveLength(1)
    expect(exerciseProgression([w], 'Nombre antiguo')).toHaveLength(0)
  })

  it('no usa entrenamientos abandonados', () => {
    const w = workout('w1', at(2026, 9, 3), [{ id: 'press', sets: [done(60, 8)] }], { status: 'abandoned' })
    expect(exerciseProgression([w], 'press')).toEqual([])
  })

  it('el tooltip lista las series realizadas del entrenamiento (ejemplo de METRICS.md §4)', () => {
    const w = workout('w1', at(2026, 9, 3), [
      { id: 'press', sets: [done(57.5, 6, 3), done(60, 8, 1), done(60, 8, 2), pending(60, 8, 4)] },
    ])
    const [point] = exerciseProgression([w], 'press')
    expect(formatProgressionTooltip(point)).toBe('60 kg × 8 · 60 kg × 8 · 57,5 kg × 6')
  })

  it('fusiona en un solo punto un ejercicio repetido dentro del mismo entrenamiento', () => {
    const w = workout('w1', at(2026, 9, 3), [
      { id: 'press', sets: [done(60, 8, 1)] },
      { id: 'press', sets: [done(70, 3, 1)] },
    ])
    const points = exerciseProgression([w], 'press')
    expect(points).toHaveLength(1)
    expect(points[0].topWeightKg).toBe(70)
  })

  it('resume primer peso, peso actual, mejor peso y cambio total', () => {
    const points = exerciseProgression(
      [
        lift('a', at(2026, 8, 1), 'press', 60),
        lift('b', at(2026, 8, 15), 'press', 70),
        lift('c', at(2026, 9, 1), 'press', 67.5),
      ],
      'press',
    )
    expect(progressionSummary(points)).toEqual({ firstKg: 60, currentKg: 67.5, bestKg: 70, changeKg: 7.5 })
    expect(progressionSummary([])).toBeNull()
  })

  it('filtra por rango relativo a hoy', () => {
    const points = exerciseProgression(
      [
        lift('a', at(2026, 3, 1), 'press', 50),
        lift('b', at(2026, 7, 1), 'press', 55),
        lift('c', at(2026, 9, 20), 'press', 60),
      ],
      'press',
    )
    const today = '2026-09-28'
    expect(filterProgressionByRange(points, '1m', today).map((p) => p.workoutId)).toEqual(['c'])
    expect(filterProgressionByRange(points, '3m', today).map((p) => p.workoutId)).toEqual(['b', 'c'])
    expect(filterProgressionByRange(points, '6m', today).map((p) => p.workoutId)).toEqual(['b', 'c'])
    expect(filterProgressionByRange(points, 'all', today).map((p) => p.workoutId)).toEqual(['a', 'b', 'c'])
  })
})

// ---- §5 Ejercicios con más peso ----------------------------------------

describe('ejercicios con más peso (Home)', () => {
  // Mes evaluado: septiembre de 2026 → (2026, 8)
  it('press banca: 80 kg antes del mes y 82,5 / 85 en el mes → cuenta, +5 kg', () => {
    const result = increasedWeightExercises(
      [
        lift('prev', at(2026, 8, 25), 'banca', 80),
        lift('m1', at(2026, 9, 2), 'banca', 82.5),
        lift('m2', at(2026, 9, 16), 'banca', 85),
      ],
      2026,
      8,
    )
    expect(result).toEqual([{ exerciseId: 'banca', name: 'banca', monthMax: 85, reference: 80, gainKg: 5 }])
  })

  it('sentadilla: primera vez en el mes, 60 y luego 62,5 → referencia 60, cuenta, +2,5 kg', () => {
    const result = increasedWeightExercises(
      [lift('m1', at(2026, 9, 3), 'sentadilla', 60), lift('m2', at(2026, 9, 17), 'sentadilla', 62.5)],
      2026,
      8,
    )
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ exerciseId: 'sentadilla', reference: 60, monthMax: 62.5, gainKg: 2.5 })
  })

  it('remo: un solo entrenamiento en el mes y nada antes → no cuenta', () => {
    expect(increasedWeightExercises([lift('m1', at(2026, 9, 3), 'remo', 70)], 2026, 8)).toEqual([])
  })

  it('no cuenta si el máximo del mes no supera la referencia', () => {
    const result = increasedWeightExercises(
      [lift('prev', at(2026, 8, 20), 'banca', 90), lift('m1', at(2026, 9, 3), 'banca', 85)],
      2026,
      8,
    )
    expect(result).toEqual([])
  })

  it('la referencia es el entrenamiento más reciente ANTES del mes, no el mejor de todos', () => {
    const result = increasedWeightExercises(
      [
        lift('old', at(2026, 5, 1), 'banca', 100),
        lift('prev', at(2026, 8, 30), 'banca', 80),
        lift('m1', at(2026, 9, 5), 'banca', 82.5),
      ],
      2026,
      8,
    )
    expect(result[0]).toMatchObject({ reference: 80, monthMax: 82.5, gainKg: 2.5 })
  })

  it('ignora entrenamientos de meses posteriores y los no completados', () => {
    const result = increasedWeightExercises(
      [
        lift('prev', at(2026, 8, 25), 'banca', 80),
        lift('m1', at(2026, 9, 5), 'banca', 82.5),
        lift('next', at(2026, 10, 5), 'banca', 120),
        workout('ab', at(2026, 9, 7), [{ id: 'banca', sets: [done(200, 1)] }], { status: 'abandoned' }),
      ],
      2026,
      8,
    )
    expect(result[0]).toMatchObject({ monthMax: 82.5, gainKg: 2.5 })
  })

  it('ordena por mayor ganancia', () => {
    const result = increasedWeightExercises(
      [
        lift('p1', at(2026, 8, 20), 'a', 50),
        lift('p2', at(2026, 8, 20), 'b', 50),
        lift('m1', at(2026, 9, 5), 'a', 52.5),
        lift('m2', at(2026, 9, 5), 'b', 60),
      ],
      2026,
      8,
    )
    expect(result.map((r) => r.exerciseId)).toEqual(['b', 'a'])
  })
})

// ---- §6 Series por grupo muscular y semana -----------------------------

describe('series por grupo muscular y semana', () => {
  const groups: CatalogMuscleGroup[] = [
    { id: 'g-pecho', name: 'Pecho' },
    { id: 'g-espalda', name: 'Espalda' },
    { id: 'g-piernas', name: 'Piernas' },
  ]
  const exercises: CatalogExercise[] = [
    { id: 'banca', name: 'Press banca', muscle_group_id: 'g-pecho' },
    { id: 'aperturas', name: 'Aperturas', muscle_group_id: 'g-pecho' },
    { id: 'remo', name: 'Remo', muscle_group_id: 'g-espalda' },
  ]

  it('la semana va de lunes a domingo', () => {
    expect(weekStartKey('2026-09-28')).toBe('2026-09-28') // lunes
    expect(weekStartKey('2026-10-04')).toBe('2026-09-28') // domingo
    expect(weekStartKey('2026-09-30')).toBe('2026-09-28') // miércoles
  })

  it('lista todos los grupos, incluidos los de 0 series, y suma el total', () => {
    const result = weeklySetsByMuscleGroup(
      [
        workout('w1', at(2026, 9, 29), [
          { id: 'banca', sets: [done(80, 8, 1), done(80, 8, 2), done(80, 8, 3)] },
          { id: 'remo', sets: [done(60, 10, 1), pending(60, 10, 2)] },
        ]),
      ],
      exercises,
      groups,
      '2026-09-28',
    )
    expect(result.groups.map((g) => [g.name, g.sets])).toEqual([
      ['Pecho', 3],
      ['Espalda', 1],
      ['Piernas', 0],
    ])
    expect(result.total).toBe(4)
    expect(result.weekStart).toBe('2026-09-28')
    expect(result.weekEnd).toBe('2026-10-04')
  })

  it('calcula el cambio respecto a la semana anterior por grupo y en total', () => {
    const result = weeklySetsByMuscleGroup(
      [
        workout('prev', at(2026, 9, 22), [{ id: 'banca', sets: [done(80, 8, 1), done(80, 8, 2), done(80, 8, 3), done(80, 8, 4), done(80, 8, 5)] }]),
        workout('now', at(2026, 9, 29), [
          { id: 'banca', sets: [done(80, 8, 1), done(80, 8, 2), done(80, 8, 3)] },
          { id: 'remo', sets: [done(60, 10, 1)] },
        ]),
      ],
      exercises,
      groups,
      '2026-09-28',
    )
    const pecho = result.groups[0]
    expect([pecho.sets, pecho.previousSets, pecho.change]).toEqual([3, 5, -2])
    expect(result.groups[1].change).toBe(1)
    expect([result.total, result.previousTotal, result.change]).toEqual([4, 5, -1])
  })

  it('el domingo pertenece a la semana que termina y el lunes a la siguiente', () => {
    const sets = [done(50, 10)]
    const workouts = [
      workout('dom', at(2026, 9, 27, 22), [{ id: 'banca', sets }]), // domingo, semana anterior
      workout('lun', at(2026, 9, 28, 7), [{ id: 'banca', sets }]), // lunes, semana actual
    ]
    const result = weeklySetsByMuscleGroup(workouts, exercises, groups, '2026-09-28')
    expect(result.total).toBe(1)
    expect(result.previousTotal).toBe(1)
  })

  it('cada grupo detalla los ejercicios que aportaron series', () => {
    const result = weeklySetsByMuscleGroup(
      [
        workout('w1', at(2026, 9, 29), [
          { id: 'aperturas', sets: [done(20, 12, 1)] },
          { id: 'banca', sets: [done(80, 8, 1), done(80, 8, 2)] },
        ]),
      ],
      exercises,
      groups,
      '2026-09-28',
    )
    expect(result.groups[0].exercises).toEqual([
      { exerciseId: 'banca', name: 'Press banca', sets: 2 },
      { exerciseId: 'aperturas', name: 'Aperturas', sets: 1 },
    ])
  })

  it('usa el grupo ACTUAL del ejercicio: si el admin lo cambia, la semana pasada se recalcula', () => {
    const w = workout('w1', at(2026, 9, 29), [{ id: 'banca', sets: [done(80, 8)] }])
    const moved = exercises.map((e) => (e.id === 'banca' ? { ...e, muscle_group_id: 'g-piernas' } : e))
    const result = weeklySetsByMuscleGroup([w], moved, groups, '2026-09-28')
    expect(result.groups.map((g) => g.sets)).toEqual([0, 0, 1])
  })

  it('las series de ejercicios fuera del catálogo se informan aparte y no entran en el total', () => {
    const w = workout('w1', at(2026, 9, 29), [{ id: 'desconocido', sets: [done(10, 10, 1), done(10, 10, 2)] }])
    const result = weeklySetsByMuscleGroup([w], exercises, groups, '2026-09-28')
    expect(result.total).toBe(0)
    expect(result.unassignedSets).toBe(2)
  })

  it('una semana sin entrenamientos completados devuelve todo a 0', () => {
    const w = workout('w1', at(2026, 9, 29), [{ id: 'banca', sets: [done(80, 8)] }], { status: 'abandoned' })
    const result = weeklySetsByMuscleGroup([w], exercises, groups, '2026-09-28')
    expect(result.total).toBe(0)
    expect(result.groups.every((g) => g.sets === 0)).toBe(true)
  })
})

// ---- §7 Estado del calendario ------------------------------------------

describe('estado de cada día del calendario', () => {
  const TODAY = '2026-09-28'
  const sets = [done(50, 10)]

  it('hoy con rutina y sin entrenamiento completado → Programado', () => {
    expect(calendarDayStatus({ dateKey: TODAY, hasAssignment: true, fulfillingWorkouts: 0, todayKey: TODAY })).toBe('scheduled')
  })

  it('fecha futura con rutina → Programado', () => {
    expect(calendarDayStatus({ dateKey: '2026-10-05', hasAssignment: true, fulfillingWorkouts: 0, todayKey: TODAY })).toBe('scheduled')
  })

  it('fecha pasada con rutina y sin entrenamiento → Sin entrenar', () => {
    expect(calendarDayStatus({ dateKey: '2026-09-20', hasAssignment: true, fulfillingWorkouts: 0, todayKey: TODAY })).toBe('not_trained')
  })

  it('sin asignación ni entrenamiento → sin marcador', () => {
    expect(calendarDayStatus({ dateKey: '2026-09-20', hasAssignment: false, fulfillingWorkouts: 0, todayKey: TODAY })).toBeNull()
  })

  it('entrenamiento completado → Completado, con o sin asignación', () => {
    expect(calendarDayStatus({ dateKey: '2026-09-20', hasAssignment: false, fulfillingWorkouts: 1, todayKey: TODAY })).toBe('completed')
    expect(calendarDayStatus({ dateKey: '2026-09-20', hasAssignment: true, fulfillingWorkouts: 1, todayKey: TODAY })).toBe('completed')
  })

  it('entrenamiento hecho un día tarde completa el día planificado y no el día real', () => {
    const late = workout('w1', at(2026, 9, 22), [{ id: 'e', sets }], { scheduledDate: '2026-09-20' })
    const statuses = buildCalendarStatuses([{ scheduled_date: '2026-09-20' }], [late], TODAY)
    expect(statuses.get('2026-09-20')).toBe('completed')
    expect(statuses.has('2026-09-22')).toBe(false)
  })

  it('entrenamiento libre (sin scheduled_date) completa el día en que empezó', () => {
    const free = workout('w1', at(2026, 9, 24), [{ id: 'e', sets }])
    const statuses = buildCalendarStatuses([], [free], TODAY)
    expect(statuses.get('2026-09-24')).toBe('completed')
  })

  it('un entrenamiento libre en un día con asignación lo completa', () => {
    const free = workout('w1', at(2026, 9, 24), [{ id: 'e', sets }])
    const statuses = buildCalendarStatuses([{ scheduled_date: '2026-09-24' }], [free], TODAY)
    expect(statuses.get('2026-09-24')).toBe('completed')
  })

  it('un entrenamiento abandonado, activo o pausado nunca completa el día', () => {
    const workouts = (['abandoned', 'active', 'paused'] as const).map((status, i) =>
      workout(`w${i}`, at(2026, 9, 20 + i), [{ id: 'e', sets }], { status, scheduledDate: `2026-09-${20 + i}` }),
    )
    const assignments = [20, 21, 22].map((d) => ({ scheduled_date: `2026-09-${d}` }))
    const statuses = buildCalendarStatuses(assignments, workouts, TODAY)
    expect([...statuses.values()]).toEqual(['not_trained', 'not_trained', 'not_trained'])
  })

  it('hoy con rutina sigue Programado mientras el entrenamiento no esté completado', () => {
    const active = workout('w1', at(2026, 9, 28), [{ id: 'e', sets }], { status: 'active', scheduledDate: TODAY })
    expect(buildCalendarStatuses([{ scheduled_date: TODAY }], [active], TODAY).get(TODAY)).toBe('scheduled')
    const completed = { ...active, status: 'completed' as const }
    expect(buildCalendarStatuses([{ scheduled_date: TODAY }], [completed], TODAY).get(TODAY)).toBe('completed')
  })

  it('un entrenamiento con scheduled_date solo cumple esa fecha, no su fecha de sesión', () => {
    const w = workout('w1', at(2026, 9, 22), [{ id: 'e', sets }], { scheduledDate: '2026-09-20' })
    expect(workoutsFulfillingDate([w], '2026-09-20')).toHaveLength(1)
    expect(workoutsFulfillingDate([w], '2026-09-22')).toHaveLength(0)
  })
})

// ---- §8 Detalle del día -------------------------------------------------

describe('detalle del día del calendario', () => {
  const TODAY = '2026-09-28'
  const routine = {
    name: 'Empuje A',
    routine_exercises: [
      { routine_sets: [{ planned_weight_kg: 80, planned_reps: 8 }, { planned_weight_kg: 80, planned_reps: 8 }] },
      { routine_sets: [{ planned_weight_kg: 20, planned_reps: 12 }] },
    ],
  }

  it('día programado: rutina asignada y volumen planificado', () => {
    expect(calendarDayDetail({ dateKey: '2026-10-01', assignedRoutine: routine, workouts: [], todayKey: TODAY })).toEqual({
      dateKey: '2026-10-01',
      status: 'scheduled',
      blocks: [{ kind: 'planned', status: 'scheduled', routineName: 'Empuje A', exercises: 2, totalSets: 3, plannedVolumeKg: 1520 }],
    })
  })

  it('día sin entrenar: mismo detalle con estado Sin entrenar', () => {
    const detail = calendarDayDetail({ dateKey: '2026-09-20', assignedRoutine: routine, workouts: [], todayKey: TODAY })
    expect(detail?.status).toBe('not_trained')
    expect(detail?.blocks[0]).toMatchObject({ kind: 'planned', status: 'not_trained' })
  })

  it('día completado: series realizadas sobre el total y volumen real', () => {
    const w = workout(
      'w1',
      at(2026, 9, 20),
      [
        { id: 'a', sets: [done(80, 8, 1), done(80, 8, 2), pending(80, 8, 3)] },
        { id: 'b', sets: [done(20, 12, 1)] },
      ],
      { routine: 'Empuje A', scheduledDate: '2026-09-20' },
    )
    const detail = calendarDayDetail({ dateKey: '2026-09-20', assignedRoutine: routine, workouts: [w], todayKey: TODAY })
    expect(detail?.status).toBe('completed')
    expect(detail?.blocks).toEqual([
      { kind: 'completed', workoutId: 'w1', routineName: 'Empuje A', exercises: 2, setsPerformed: 3, totalSets: 4, volumeKg: 1520 },
    ])
  })

  it('si la rutina de origen ya no existe, el nombre es "Entrenamiento"', () => {
    const w = workout('w1', at(2026, 9, 20), [{ id: 'a', sets: [done(50, 10)] }])
    const detail = calendarDayDetail({ dateKey: '2026-09-20', assignedRoutine: null, workouts: [w], todayKey: TODAY })
    expect(detail?.blocks[0]).toMatchObject({ routineName: 'Entrenamiento' })
  })

  it('varios entrenamientos completados el mismo día → un bloque cada uno, por hora de inicio', () => {
    const tarde = workout('tarde', at(2026, 9, 20, 19), [{ id: 'a', sets: [done(50, 10)] }])
    const manana = workout('manana', at(2026, 9, 20, 8), [{ id: 'a', sets: [done(50, 10)] }])
    const detail = calendarDayDetail({ dateKey: '2026-09-20', assignedRoutine: null, workouts: [tarde, manana], todayKey: TODAY })
    expect(detail?.blocks.map((b) => (b.kind === 'completed' ? b.workoutId : null))).toEqual(['manana', 'tarde'])
  })

  it('una fecha sin marcador no tiene detalle', () => {
    expect(calendarDayDetail({ dateKey: '2026-09-20', assignedRoutine: null, workouts: [], todayKey: TODAY })).toBeNull()
  })
})

// ---- Formato es-ES ------------------------------------------------------

describe('formato de presentación', () => {
  it('volumen con separador de miles es-ES y como máximo un decimal', () => {
    expect(formatVolumeKg(1305)).toBe('1.305 kg')
    expect(formatVolumeKg(12450)).toBe('12.450 kg')
    expect(formatVolumeKg(480)).toBe('480 kg')
    expect(formatVolumeKg(1234.56)).toBe('1.234,6 kg')
    expect(formatVolumeKg(0)).toBe('0 kg')
  })

  it('pesos con coma decimal', () => {
    expect(formatKg(60)).toBe('60 kg')
    expect(formatKg(57.5)).toBe('57,5 kg')
  })

  it('ganancias con signo explícito', () => {
    expect(formatSignedKg(2.5)).toBe('+2,5 kg')
    expect(formatSignedKg(5)).toBe('+5 kg')
    expect(formatSignedKg(-2.5)).toBe('−2,5 kg')
    expect(formatSignedKg(0)).toBe('0 kg')
  })

  it('series realizadas sobre el total', () => {
    expect(formatSetsProgress(14, 16)).toBe('14 de 16 series')
    expect(formatSetsProgress(1, 1)).toBe('1 de 1 serie')
  })

  it('cambio semanal', () => {
    expect(formatWeekChange(3)).toBe('+3')
    expect(formatWeekChange(-2)).toBe('−2')
    expect(formatWeekChange(0)).toBe('=')
  })
})
