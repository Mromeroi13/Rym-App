import { useState } from 'react'
import { addDaysKey, todayKey } from '@/utils/dates'
import { weekStartKey } from './metrics'
import { useExerciseProgression } from './hooks/useExerciseProgression'
import { useWeeklyMuscleSets } from './hooks/useWeeklyMuscleSets'
import { useBodyWeightLogs } from '@/features/profile/hooks/useBodyWeightLogs'
import { BodyWeightChart } from '@/features/profile/components/BodyWeightChart'
import { BodyWeightLogForm } from '@/features/profile/components/BodyWeightLogForm'
import { ExerciseSelector } from './components/ExerciseSelector'
import { ExerciseProgressionChart } from './components/ExerciseProgressionChart'
import { WeeklyMuscleGroupsCard } from './components/WeeklyMuscleGroupsCard'

export function ProgressPage() {
  const currentWeekStart = weekStartKey(todayKey())
  const [weekAnchor, setWeekAnchor] = useState(currentWeekStart)
  const [selectedExercise, setSelectedExercise] = useState<{ id: string; name: string } | null>(null)

  const progression = useExerciseProgression(selectedExercise?.id ?? null)
  const weekly = useWeeklyMuscleSets(weekAnchor)
  const bodyWeight = useBodyWeightLogs()

  function shiftWeek(delta: -1 | 1) {
    setWeekAnchor((current) => addDaysKey(current, delta * 7))
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Progreso</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Progresión de tus ejercicios y series por grupo muscular.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[20rem_1fr]">
        <ExerciseSelector
          selectedId={selectedExercise?.id ?? null}
          onSelect={(id, name) => setSelectedExercise({ id, name })}
        />

        <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
          <h2 className="font-heading text-lg font-bold text-textPrimary">
            {selectedExercise ? selectedExercise.name : 'Progresión de peso'}
          </h2>
          <div className="mt-4">
            {selectedExercise ? (
              <ExerciseProgressionChart
                points={progression.points}
                loading={progression.loading}
                error={progression.error}
                onRetry={progression.refresh}
              />
            ) : (
              <p className="rounded-xl bg-background p-4 text-center text-sm text-textSecondary">
                Selecciona un ejercicio para ver su progresión.
              </p>
            )}
          </div>
        </div>
      </div>

      <WeeklyMuscleGroupsCard
        data={weekly.data}
        loading={weekly.loading}
        error={weekly.error}
        onRetry={weekly.refresh}
        onShiftWeek={shiftWeek}
        onGoToCurrentWeek={() => setWeekAnchor(currentWeekStart)}
        isCurrentWeek={weekAnchor === currentWeekStart}
      />

      {/* Peso corporal histórico */}
      <div className="rounded-xl border border-border bg-surface p-5 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-textPrimary">Peso corporal</h2>
          <BodyWeightLogForm onSaved={bodyWeight.refresh} />
        </div>
        <BodyWeightChart
          logs={bodyWeight.logs}
          loading={bodyWeight.loading}
          error={bodyWeight.error}
          onRetry={bodyWeight.refresh}
        />
      </div>
    </div>
  )
}
