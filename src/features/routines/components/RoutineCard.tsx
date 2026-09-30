import { Link } from 'react-router-dom'
import { CalendarPlus, Pencil, Play, Repeat, Trash2 } from 'lucide-react'
import type { RoutineWithDetails } from '../types'
import { countSets, summarizeSets } from '../utils'

interface RoutineCardProps {
  routine: RoutineWithDetails
  onAssign: (routine: RoutineWithDetails) => void
  onDelete: (routine: RoutineWithDetails) => void
}

const MAX_VISIBLE = 5

export function RoutineCard({ routine, onAssign, onDelete }: RoutineCardProps) {
  const exercises = routine.routine_exercises
  const visible = exercises.slice(0, MAX_VISIBLE)
  const hidden = exercises.length - visible.length

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-5">
      <h3 className="font-heading text-lg font-bold text-textPrimary">{routine.name}</h3>
      {routine.description && (
        <p className="mt-1 line-clamp-2 text-sm text-textSecondary">{routine.description}</p>
      )}

      <div className="mt-4 flex items-center gap-4 rounded-xl bg-background p-3 text-xs text-textSecondary">
        <span className="font-semibold text-textPrimary">{exercises.length} ejercicios</span>
        <span className="inline-flex items-center gap-1">
          <Repeat size={12} /> {countSets(routine)} series
        </span>
      </div>

      <div className="mt-4 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
          Secuencia del plan
        </span>
        {exercises.length === 0 ? (
          <p className="mt-2 text-sm text-textSecondary">Esta rutina aún no tiene ejercicios.</p>
        ) : (
          <ol className="mt-2 flex flex-col gap-1.5">
            {visible.map((re, index) => (
              <li
                key={re.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-xs text-textSecondary">{index + 1}</span>
                  <span className="truncate text-textPrimary">{re.exercises?.name ?? 'Ejercicio'}</span>
                </span>
                <span className="shrink-0 text-xs font-medium text-textSecondary">
                  {summarizeSets(re.routine_sets, re.mode)}
                </span>
              </li>
            ))}
            {hidden > 0 && <li className="px-1 text-xs text-textSecondary">+{hidden} más</li>}
          </ol>
        )}
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link
          to={`/entrenamiento/iniciar/${routine.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
        >
          <Play size={16} />
          Iniciar rutina
        </Link>
        <button
          type="button"
          onClick={() => onAssign(routine)}
          title="Asignar a fecha"
          aria-label="Asignar a fecha"
          className="rounded-xl bg-background p-2.5 text-textSecondary hover:bg-border/60 hover:text-textPrimary"
        >
          <CalendarPlus size={16} />
        </button>
        <Link
          to={`/rutinas/${routine.id}/editar`}
          title="Editar"
          className="rounded-xl bg-background p-2.5 text-textSecondary hover:bg-border/60 hover:text-textPrimary"
        >
          <Pencil size={16} />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(routine)}
          title="Eliminar"
          className="rounded-xl bg-background p-2.5 text-textSecondary hover:bg-critical/10 hover:text-critical"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
