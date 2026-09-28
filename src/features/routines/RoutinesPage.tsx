import { useState } from 'react'
import { Link } from 'react-router-dom'
import { History, Plus } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { ExerciseExplorer } from '@/features/exercises/ExerciseExplorer'
import { OpenWorkoutBanner } from '@/features/workouts/components/OpenWorkoutBanner'
import { useRoutines } from './hooks/useRoutines'
import { deleteRoutine } from './routineApi'
import { RoutineCard } from './components/RoutineCard'
import { AssignRoutineDialog } from './components/AssignRoutineDialog'
import type { RoutineWithDetails } from './types'

export function RoutinesPage() {
  const { routines, loading, error, refresh } = useRoutines()
  const [assigning, setAssigning] = useState<RoutineWithDetails | null>(null)
  const [deleting, setDeleting] = useState<RoutineWithDetails | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteRoutine(deleting.id)
      setDeleting(null)
      setMessage('Rutina eliminada.')
      refresh()
    } catch {
      setDeleteError('No se pudo eliminar la rutina. Inténtalo de nuevo.')
    }
    setDeleteBusy(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-heading text-2xl font-bold text-textPrimary">Mis Rutinas</h1>
          <p className="mt-1 text-sm text-textSecondary">
            Gestiona, planifica y asigna a tu calendario tus plantillas de entrenamiento.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            to="/entrenamientos"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-textPrimary transition-colors hover:bg-border/60"
          >
            <History size={16} />
            Historial
          </Link>
          <Link
            to="/rutinas/nueva"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            Nueva Rutina
          </Link>
        </div>
      </div>

      <OpenWorkoutBanner />

      {message && (
        <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-success/70 hover:text-success">
            ✕
          </button>
        </div>
      )}

      {loading && <p className="text-sm text-textSecondary">Cargando rutinas...</p>}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => refresh()}
            className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && routines.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <h2 className="font-heading text-lg font-bold text-textPrimary">Aún no tienes rutinas</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-textSecondary">
            Crea tu primera plantilla eligiendo ejercicios del catálogo y configurando el peso y las
            repeticiones de cada serie.
          </p>
          <Link
            to="/rutinas/nueva"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            <Plus size={16} />
            Crear mi primera rutina
          </Link>
        </div>
      )}

      {!loading && !error && routines.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {routines.map((routine) => (
            <RoutineCard key={routine.id} routine={routine} onAssign={setAssigning} onDelete={setDeleting} />
          ))}
        </div>
      )}

      <ExerciseExplorer />

      {assigning && (
        <AssignRoutineDialog
          routines={routines}
          fixedRoutineId={assigning.id}
          onClose={() => setAssigning(null)}
          onAssigned={() => setMessage(`«${assigning.name}» asignada al calendario.`)}
        />
      )}

      {deleting && (
        <Modal
          title="Eliminar rutina"
          description={`¿Seguro que quieres eliminar «${deleting.name}»? Se quitará también de tu calendario. Tu historial de entrenamientos se conserva.`}
          onClose={() => setDeleting(null)}
        >
          {deleteError && <p className="mb-3 text-sm text-critical">{deleteError}</p>}
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteBusy}
              className="rounded-xl bg-critical px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-critical/90 disabled:opacity-60"
            >
              {deleteBusy ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
