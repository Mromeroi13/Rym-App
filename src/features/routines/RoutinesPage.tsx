import { ExerciseExplorer } from '@/features/exercises/ExerciseExplorer'

export function RoutinesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Rutinas</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Gestiona, inicia o planifica tus programas de entrenamiento sistemático.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <h2 className="font-heading text-lg font-bold text-textPrimary">Mis Rutinas</h2>
        <p className="mt-2 text-sm text-textSecondary">
          Próximamente: creación y edición de tus plantillas de rutina.
        </p>
      </div>

      <ExerciseExplorer />
    </div>
  )
}
