import { useMemo, useState } from 'react'
import { Dumbbell, Film, Search, Send, Star, TrendingUp } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useMuscleGroups } from './hooks/useMuscleGroups'
import { useExercises } from './hooks/useExercises'
import { useMyProposals } from './hooks/useMyProposals'
import { useFavorites } from './hooks/useFavorites'
import { ProposeExerciseDialog } from './components/ProposeExerciseDialog'
import { ProposalStatusBadge } from './components/ProposalStatusBadge'
import { FavoriteStar } from './components/FavoriteStar'
import { ExerciseGifModal } from './components/ExerciseGifModal'
import { filterPickerExercises } from '@/features/routines/pickerFilter'
import { ExerciseProgressionDialog } from '@/features/progress/components/ExerciseProgressionDialog'

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

  const favorites = useFavorites()
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [showProposeDialog, setShowProposeDialog] = useState(false)
  const [progressionExercise, setProgressionExercise] = useState<{ id: string; name: string } | null>(null)
  const [gifExercise, setGifExercise] = useState<{ name: string; gifUrl: string | null } | null>(null)

  const filteredExercises = useMemo(
    () =>
      filterPickerExercises(exercises, favorites.favoriteIds, {
        groupId: selectedGroupId,
        search,
        favoritesOnly,
      }),
    [exercises, favorites.favoriteIds, selectedGroupId, search, favoritesOnly],
  )

  const hasVisibleFavorites = exercises.some((e) => favorites.favoriteIds.has(e.id))

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
          <button
            type="button"
            onClick={() => setFavoritesOnly((v) => !v)}
            aria-pressed={favoritesOnly}
            className={`${tabClasses(favoritesOnly)} inline-flex items-center gap-1`}
          >
            <Star size={12} className={favoritesOnly ? 'fill-white' : ''} /> Favoritos
          </button>
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
        {favorites.error && (
          <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-critical/30 bg-critical/10 p-3 text-sm text-critical">
            <span>{favorites.error}</span>
            <button
              type="button"
              onClick={favorites.dismissError}
              className="shrink-0 rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
            >
              Cerrar
            </button>
          </div>
        )}
        {!loading && !exercisesError && filteredExercises.length === 0 && favoritesOnly && !hasVisibleFavorites && (
          <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">
            Aún no tienes favoritos. Marca una estrella en cualquier ejercicio para tenerlo aquí.
          </p>
        )}
        {!loading && !exercisesError && filteredExercises.length === 0 && !(favoritesOnly && !hasVisibleFavorites) && (
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
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-textPrimary">{exercise.name}</p>
                  <p className="truncate text-xs text-textSecondary">
                    {exercise.muscle_groups?.name ?? 'Sin grupo'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setProgressionExercise({ id: exercise.id, name: exercise.name })}
                  title="Ver progresión de peso"
                  className="shrink-0 rounded-lg p-1 text-textSecondary transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <TrendingUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setGifExercise({ name: exercise.name, gifUrl: exercise.gif_url ?? null })}
                  title="Ver demostración"
                  className="shrink-0 rounded-lg p-1 text-textSecondary transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Film size={16} />
                </button>
                <FavoriteStar
                  exerciseName={exercise.name}
                  active={favorites.isFavorite(exercise.id)}
                  disabled={favorites.isPending(exercise.id)}
                  onToggle={() => favorites.toggle(exercise.id)}
                />
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

      {gifExercise && (
        <ExerciseGifModal
          exerciseName={gifExercise.name}
          gifUrl={gifExercise.gifUrl}
          onClose={() => setGifExercise(null)}
        />
      )}

      {progressionExercise && (
        <ExerciseProgressionDialog
          exerciseId={progressionExercise.id}
          exerciseName={progressionExercise.name}
          onClose={() => setProgressionExercise(null)}
        />
      )}
    </div>
  )
}
