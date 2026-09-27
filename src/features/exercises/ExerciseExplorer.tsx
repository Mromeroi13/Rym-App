import { useMemo, useState } from 'react'
import { Dumbbell, Search, Send } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useMuscleGroups } from './hooks/useMuscleGroups'
import { useExercises } from './hooks/useExercises'
import { useMyProposals } from './hooks/useMyProposals'
import { ProposeExerciseDialog } from './components/ProposeExerciseDialog'
import { ProposalStatusBadge } from './components/ProposalStatusBadge'

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

export function ExerciseExplorer() {
  const { profile } = useAuth()
  const { groups, loading: groupsLoading } = useMuscleGroups()
  const { exercises, loading: exercisesLoading, error: exercisesError } = useExercises()
  const {
    proposals,
    loading: proposalsLoading,
    refresh: refreshProposals,
  } = useMyProposals(profile?.id)

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showProposeDialog, setShowProposeDialog] = useState(false)

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesGroup = !selectedGroupId || exercise.muscle_group_id === selectedGroupId
      const matchesSearch = exercise.name.toLowerCase().includes(search.trim().toLowerCase())
      return matchesGroup && matchesSearch
    })
  }, [exercises, selectedGroupId, search])

  const loading = groupsLoading || exercisesLoading

  return (
    <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="font-heading text-lg font-bold text-textPrimary">
            Explorador de Ejercicios por Grupo Muscular
          </h2>
          <p className="mt-1 text-sm text-textSecondary">
            Consulta el catálogo oficial de ejercicios. ¿No encuentras uno? Solicita que se añada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowProposeDialog(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-textPrimary transition-colors hover:bg-border/60"
        >
          <Send size={16} />
          Solicitar Ejercicio
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        <div className="relative flex items-center">
          <Search size={16} className="pointer-events-none absolute left-3.5 text-textSecondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar ejercicio..."
            className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setSelectedGroupId(null)} className={tabClasses(selectedGroupId === null)}>
            Todos
          </button>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setSelectedGroupId(group.id)}
              className={tabClasses(selectedGroupId === group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        {loading && <p className="text-sm text-textSecondary">Cargando ejercicios...</p>}
        {exercisesError && <p className="text-sm text-critical">{exercisesError}</p>}
        {!loading && !exercisesError && filteredExercises.length === 0 && (
          <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">
            No hay ejercicios que coincidan con tu búsqueda.
          </p>
        )}
        {!loading && !exercisesError && filteredExercises.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Dumbbell size={18} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-textPrimary">{exercise.name}</p>
                  <p className="truncate text-xs text-textSecondary">
                    {exercise.muscle_groups?.name ?? 'Sin grupo'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {profile && (proposalsLoading || proposals.length > 0) && (
        <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-sm font-semibold text-textPrimary">Mis solicitudes</h3>
          {proposalsLoading ? (
            <p className="mt-2 text-sm text-textSecondary">Cargando tus solicitudes...</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {proposals.map((proposal) => (
                <div
                  key={proposal.id}
                  className="flex flex-col gap-2 rounded-xl bg-background p-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-textPrimary">{proposal.name}</p>
                    <p className="truncate text-xs text-textSecondary">
                      {proposal.muscle_groups?.name ?? 'Sin grupo'}
                      {proposal.status === 'rejected' && proposal.rejection_reason && (
                        <> · {proposal.rejection_reason}</>
                      )}
                    </p>
                  </div>
                  <ProposalStatusBadge status={proposal.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showProposeDialog && (
        <ProposeExerciseDialog
          muscleGroups={groups}
          onClose={() => setShowProposeDialog(false)}
          onProposed={refreshProposals}
        />
      )}
    </div>
  )
}
