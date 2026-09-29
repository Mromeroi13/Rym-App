import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useMuscleGroups } from '@/features/exercises/hooks/useMuscleGroups'
import { useFavorites } from '@/features/exercises/hooks/useFavorites'
import { filterPickerExercises } from '@/features/routines/pickerFilter'

interface ExerciseSelectorProps {
  selectedId: string | null
  onSelect: (id: string, name: string) => void
}

/** Selector de ejercicio para la gráfica de progresión de la página Progreso (PROG-04). */
export function ExerciseSelector({ selectedId, onSelect }: ExerciseSelectorProps) {
  const { exercises, loading } = useExercises()
  const { groups } = useMuscleGroups()
  const favorites = useFavorites()
  const [groupId, setGroupId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(
    () => filterPickerExercises(exercises, favorites.favoriteIds, { groupId, search, favoritesOnly: false }),
    [exercises, favorites.favoriteIds, groupId, search],
  )

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
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

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setGroupId(null)}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            groupId === null ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
          }`}
        >
          Todos
        </button>
        {groups.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setGroupId(g.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              groupId === g.id ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {loading && <p className="mt-3 text-sm text-textSecondary">Cargando ejercicios...</p>}
      {!loading && filtered.length === 0 && (
        <p className="mt-3 rounded-xl bg-background p-3 text-sm text-textSecondary">
          No hay ejercicios que coincidan.
        </p>
      )}
      {!loading && filtered.length > 0 && (
        <div className="mt-3 flex max-h-48 flex-col gap-1 overflow-y-auto">
          {filtered.map((exercise) => (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onSelect(exercise.id, exercise.name)}
              className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedId === exercise.id
                  ? 'bg-primary/10 font-semibold text-primary'
                  : 'text-textPrimary hover:bg-background'
              }`}
            >
              <span className="truncate">{exercise.name}</span>
              <span className="shrink-0 text-xs text-textSecondary">{exercise.muscle_groups?.name ?? 'Sin grupo'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
