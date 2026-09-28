import { Link } from 'react-router-dom'
import { Check, Clock, Dumbbell, Layers } from 'lucide-react'
import type { WorkoutWithDetails } from '../workoutTypes'
import { formatDuration } from '../timer'
import { formatNumber, formatSetValues, workoutTotals } from '../workoutUtils'

export function WorkoutSummary({ workout }: { workout: WorkoutWithDetails }) {
  const { totalSets, completedSets, volumeKg, exercisesDone } = workoutTotals(workout)
  const abandoned = workout.status === 'abandoned'
  const exerciseCount = workout.workout_exercises.length
  const dateLabel = new Date(workout.started_at).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <div
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${
            abandoned ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
          }`}
        >
          <Check size={24} />
        </div>
        <p className={`mt-4 text-xs font-bold uppercase tracking-wider ${abandoned ? 'text-warning' : 'text-success'}`}>
          {abandoned ? 'Entrenamiento abandonado' : '¡Objetivo cumplido!'}
        </p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-textPrimary">
          {workout.routines?.name ?? 'Entrenamiento'}
        </h1>
        <p className="mt-1 text-sm capitalize text-textSecondary">{dateLabel}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-background p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-textSecondary">
              <Clock size={12} /> Duración
            </span>
            <p className="mt-1 font-heading text-xl font-bold text-textPrimary">
              {workout.timer_enabled ? formatDuration(workout.elapsed_seconds) : '—'}
            </p>
            <p className="text-xs text-textSecondary">{workout.timer_enabled ? 'Con temporizador' : 'Sin temporizador'}</p>
          </div>
          <div className="rounded-xl bg-background p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-textSecondary">
              <Dumbbell size={12} /> Ejercicios
            </span>
            <p className="mt-1 font-heading text-xl font-bold text-textPrimary">
              {exercisesDone} de {exerciseCount}
            </p>
            <p className="text-xs text-textSecondary">completos</p>
          </div>
          <div className="rounded-xl bg-background p-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase text-textSecondary">
              <Layers size={12} /> Series
            </span>
            <p className="mt-1 font-heading text-xl font-bold text-textPrimary">
              {completedSets} de {totalSets}
            </p>
            <p className="text-xs text-textSecondary">completadas</p>
          </div>
          <div className="rounded-xl bg-background p-4">
            <span className="text-xs font-semibold uppercase text-textSecondary">Volumen total</span>
            <p className="mt-1 font-heading text-xl font-bold text-textPrimary">{formatNumber(volumeKg)} kg</p>
            <p className="text-xs text-textSecondary">peso × repeticiones</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <h2 className="font-heading text-lg font-bold text-textPrimary">Registro de series</h2>
        <div className="mt-4 flex flex-col gap-4">
          {workout.workout_exercises.map((exercise, index) => (
            <div key={exercise.id}>
              <p className="text-sm font-semibold text-textPrimary">
                {index + 1}. {exercise.exercise_name_snapshot}
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {exercise.workout_sets.map((set) => (
                  <div
                    key={set.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-background px-3 py-2 text-sm"
                  >
                    <span className="text-textSecondary">Serie {set.set_number}</span>
                    <span className="text-right">
                      {set.completed_at ? (
                        <span className="font-semibold text-textPrimary">
                          {formatSetValues(set.actual_weight_kg, set.actual_reps)}
                        </span>
                      ) : (
                        <span className="text-textSecondary">Sin completar</span>
                      )}
                      <span className="ml-2 text-xs text-textSecondary">
                        (plan {formatSetValues(set.planned_weight_kg, set.planned_reps)})
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          to="/entrenamientos"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
        >
          Ver historial
        </Link>
        <Link
          to="/rutinas"
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-surface px-5 text-sm font-semibold text-textPrimary border border-border hover:bg-background"
        >
          Volver a Rutinas
        </Link>
      </div>
    </div>
  )
}
