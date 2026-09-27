import { useMemo, useState } from 'react'
import { Pencil, Plus, Power, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useMuscleGroups } from '@/features/exercises/hooks/useMuscleGroups'
import { useExercises, type ExerciseWithGroup } from '@/features/exercises/hooks/useExercises'
import { ExerciseFormDialog } from './components/ExerciseFormDialog'

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

export function AdminExercisesPage() {
  const { groups, loading: groupsLoading } = useMuscleGroups()
  const {
    exercises,
    loading: exercisesLoading,
    error: exercisesError,
    refresh,
  } = useExercises({ includeInactive: true })

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [dialogState, setDialogState] = useState<
    { mode: 'create' } | { mode: 'edit'; exercise: ExerciseWithGroup } | null
  >(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [toggleError, setToggleError] = useState<string | null>(null)

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesGroup = !selectedGroupId || exercise.muscle_group_id === selectedGroupId
      const matchesSearch = exercise.name.toLowerCase().includes(search.trim().toLowerCase())
      return matchesGroup && matchesSearch
    })
  }, [exercises, selectedGroupId, search])

  const loading = groupsLoading || exercisesLoading

  async function toggleActive(exercise: ExerciseWithGroup) {
    setToggleError(null)
    setTogglingId(exercise.id)
    const { error } = await supabase
      .from('exercises')
      .update({ active: !exercise.active })
      .eq('id', exercise.id)
    setTogglingId(null)

    if (error) {
      setToggleError('No se pudo actualizar el estado del ejercicio.')
      return
    }
    refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-bold text-textPrimary">Ejercicios</h1>
          <p className="mt-1 text-sm text-textSecondary">
            Administra la biblioteca oficial de ejercicios disponible para todos los usuarios.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDialogState({ mode: 'create' })}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus size={16} />
          Crear Nuevo Ejercicio Oficial
        </button>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <Search size={16} className="pointer-events-none absolute left-3.5 text-textSecondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre de ejercicio..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedGroupId(null)}
              className={tabClasses(selectedGroupId === null)}
            >
              Todos ({exercises.length})
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => setSelectedGroupId(group.id)}
                className={tabClasses(selectedGroupId === group.id)}
              >
                {group.name} ({exercises.filter((e) => e.muscle_group_id === group.id).length})
              </button>
            ))}
          </div>
        </div>

        {toggleError && <p className="mt-4 text-sm text-critical">{toggleError}</p>}

        <div className="mt-5">
          {loading && <p className="text-sm text-textSecondary">Cargando ejercicios...</p>}
          {exercisesError && <p className="text-sm text-critical">{exercisesError}</p>}
          {!loading && !exercisesError && filteredExercises.length === 0 && (
            <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">
              No hay ejercicios que coincidan con tu búsqueda.
            </p>
          )}
          {!loading && !exercisesError && filteredExercises.length > 0 && (
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex flex-col gap-3 bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-textPrimary">{exercise.name}</p>
                    <p className="mt-0.5 truncate text-xs text-textSecondary">
                      {exercise.muscle_groups?.name ?? 'Sin grupo'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        exercise.active ? 'bg-success/10 text-success' : 'bg-textSecondary/10 text-textSecondary'
                      }`}
                    >
                      {exercise.active ? 'Oficial' : 'Inactivo'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDialogState({ mode: 'edit', exercise })}
                      title="Editar"
                      className="rounded-lg p-2 text-textSecondary hover:bg-background hover:text-textPrimary"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(exercise)}
                      disabled={togglingId === exercise.id}
                      title={exercise.active ? 'Desactivar' : 'Activar'}
                      className={`rounded-lg p-2 hover:bg-background disabled:opacity-60 ${
                        exercise.active ? 'text-critical' : 'text-success'
                      }`}
                    >
                      <Power size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {dialogState && (
        <ExerciseFormDialog
          muscleGroups={groups}
          exercise={dialogState.mode === 'edit' ? dialogState.exercise : undefined}
          onClose={() => setDialogState(null)}
          onSaved={refresh}
        />
      )}
    </div>
  )
}
