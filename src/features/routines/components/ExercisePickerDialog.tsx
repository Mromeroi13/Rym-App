import { useMemo, useState } from 'react'
import { Check, Plus, Search } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { useMuscleGroups } from '@/features/exercises/hooks/useMuscleGroups'
import { useExercises, type ExerciseWithGroup } from '@/features/exercises/hooks/useExercises'

interface ExercisePickerDialogProps {
  onPick: (exercise: ExerciseWithGroup) => void
  onClose: () => void
}

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
    isActive ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

export function ExercisePickerDialog({ onPick, onClose }: ExercisePickerDialogProps) {
  const { groups } = useMuscleGroups()
  const { exercises, loading, error } = useExercises()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [addedCount, setAddedCount] = useState<Record<string, number>>({})

  const filtered = useMemo(
    () =>
      exercises.filter(
        (e) =>
          (!selectedGroupId || e.muscle_group_id === selectedGroupId) &&
          e.name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [exercises, selectedGroupId, search],
  )

  function handlePick(exercise: ExerciseWithGroup) {
    onPick(exercise)
    setAddedCount((prev) => ({ ...prev, [exercise.id]: (prev[exercise.id] ?? 0) + 1 }))
  }

  return (
    <Modal
      title="Añadir ejercicio"
      description="Elige ejercicios del catálogo oficial. Puedes añadir varios seguidos."
      onClose={onClose}
    >
      <div className="flex flex-col gap-3">
        <div className="relative flex items-center">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-textSecondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setSelectedGroupId(null)} className={tabClasses(selectedGroupId === null)}>
            Todos
          </button>
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroupId(g.id)}
              className={tabClasses(selectedGroupId === g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-textSecondary">Cargando ejercicios...</p>}
        {error && <p className="text-sm text-critical">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">
            No hay ejercicios que coincidan. Puedes solicitar uno nuevo desde la página de Rutinas.
          </p>
        )}

        <div className="flex max-h-72 flex-col gap-2 overflow-y-auto">
          {filtered.map((exercise) => {
            const count = addedCount[exercise.id] ?? 0
            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => handlePick(exercise)}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background p-3 text-left transition-colors hover:border-primary"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textPrimary">{exercise.name}</p>
                  <p className="truncate text-xs text-textSecondary">
                    {exercise.muscle_groups?.name ?? 'Sin grupo'}
                  </p>
                </div>
                {count > 0 ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                    <Check size={14} /> Añadido{count > 1 ? ` ×${count}` : ''}
                  </span>
                ) : (
                  <Plus size={16} className="shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>

        <div className="mt-1 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            Listo
          </button>
        </div>
      </div>
    </Modal>
  )
}
