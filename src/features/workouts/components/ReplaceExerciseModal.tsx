import { useMemo, useState } from 'react'
import { Film, Search, X } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { ExerciseGifModal } from '@/features/exercises/components/ExerciseGifModal'
import { useExercises } from '@/features/exercises/hooks/useExercises'
import { useMuscleGroups } from '@/features/exercises/hooks/useMuscleGroups'

interface ReplaceExerciseModalProps {
  /** Nombre del ejercicio que se está sustituyendo (solo informativo). */
  currentExerciseName: string
  /** IDs de todos los ejercicios que ya están en la rutina activa (se excluyen de la lista). */
  currentExerciseIds: string[]
  onClose: () => void
  onReplace: (newExerciseId: string, newExerciseName: string) => void
  replacing: boolean
}

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
    isActive
      ? 'bg-primary text-white shadow-sm'
      : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

export function ReplaceExerciseModal({
  currentExerciseName,
  currentExerciseIds,
  onClose,
  onReplace,
  replacing,
}: ReplaceExerciseModalProps) {
  const { exercises, loading: exLoading } = useExercises()
  const { groups, loading: groupsLoading } = useMuscleGroups()

  const [search, setSearch] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [gifExercise, setGifExercise] = useState<{ name: string; gifUrl: string | null } | null>(null)

  const loading = exLoading || groupsLoading

  // Excluir los ejercicios que ya están en la sesión y aplicar filtros
  const filtered = useMemo(() => {
    const excluded = new Set(currentExerciseIds)
    const q = search.trim().toLowerCase()
    return exercises.filter((e) => {
      if (excluded.has(e.id)) return false
      if (selectedGroupId && e.muscle_group_id !== selectedGroupId) return false
      if (q && !e.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [exercises, currentExerciseIds, selectedGroupId, search])

  // Conteo por grupo (sobre ejercicios ya excluidos los de la sesión)
  const countByGroup = useMemo(() => {
    const excluded = new Set(currentExerciseIds)
    const map = new Map<string, number>()
    exercises.forEach((e) => {
      if (!excluded.has(e.id)) {
        map.set(e.muscle_group_id, (map.get(e.muscle_group_id) ?? 0) + 1)
      }
    })
    return map
  }, [exercises, currentExerciseIds])

  const selected = exercises.find((e) => e.id === selectedId)

  return (
    <Modal
      title="Cambiar ejercicio"
      description={`Sustituyendo: ${currentExerciseName}. Las series ya completadas se reiniciarán.`}
      onClose={onClose}
    >
      {/* Pestañas de grupo muscular */}
      {!loading && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => { setSelectedGroupId(null); setSelectedId(null) }}
            className={tabClasses(selectedGroupId === null)}
          >
            Todos ({exercises.length - currentExerciseIds.length})
          </button>
          {groups
            .filter((g) => (countByGroup.get(g.id) ?? 0) > 0)
            .map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => { setSelectedGroupId(g.id); setSelectedId(null) }}
                className={tabClasses(selectedGroupId === g.id)}
              >
                {g.name} ({countByGroup.get(g.id) ?? 0})
              </button>
            ))}
        </div>
      )}

      {/* Buscador */}
      <div className="relative mb-3 flex items-center">
        <Search size={15} className="pointer-events-none absolute left-3 text-textSecondary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          autoFocus
          className="h-10 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-2.5 text-textSecondary hover:text-textPrimary"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="max-h-60 overflow-y-auto rounded-xl border border-border">
        {loading && (
          <p className="p-4 text-center text-sm text-textSecondary">Cargando ejercicios...</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="p-4 text-center text-sm text-textSecondary">
            {search
              ? 'Sin resultados para esa búsqueda.'
              : selectedGroupId
                ? 'No hay más ejercicios disponibles en este grupo.'
                : 'No hay ejercicios disponibles.'}
          </p>
        )}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col divide-y divide-border">
            {filtered.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-center gap-1 pr-2 transition-colors ${
                  selectedId === ex.id ? 'bg-primary/10' : 'hover:bg-background'
                }`}
              >
                {/* Área de selección */}
                <button
                  type="button"
                  onClick={() => setSelectedId(ex.id === selectedId ? null : ex.id)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3 text-left text-sm"
                >
                  <span className="min-w-0">
                    <span className={`block truncate font-medium ${selectedId === ex.id ? 'text-primary' : 'text-textPrimary'}`}>
                      {ex.name}
                    </span>
                    <span className="block text-xs text-textSecondary">
                      {ex.muscle_groups?.name ?? 'Sin grupo'}
                    </span>
                  </span>
                  {selectedId === ex.id && (
                    <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                      Seleccionado
                    </span>
                  )}
                </button>

                {/* Botón GIF */}
                <button
                  type="button"
                  onClick={() => setGifExercise({ name: ex.name, gifUrl: ex.gif_url ?? null })}
                  title="Ver demostración"
                  className="shrink-0 rounded-lg p-1.5 text-textSecondary transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Film size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Aviso de reset */}
      <p className="mt-3 text-xs text-textSecondary">
        ⚠️ Si ya completaste series de este ejercicio, se reiniciarán al cambiar.
      </p>

      {gifExercise && (
        <ExerciseGifModal
          exerciseName={gifExercise.name}
          gifUrl={gifExercise.gifUrl}
          onClose={() => setGifExercise(null)}
        />
      )}

      {/* Acciones */}
      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={replacing}
          className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={() => selected && onReplace(selected.id, selected.name)}
          disabled={!selectedId || replacing}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          {replacing ? 'Cambiando...' : `Usar ${selected?.name ?? 'ejercicio'}`}
        </button>
      </div>
    </Modal>
  )
}
