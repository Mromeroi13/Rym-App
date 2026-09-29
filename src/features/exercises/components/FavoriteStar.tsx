import { Star } from 'lucide-react'

interface FavoriteStarProps {
  exerciseName: string
  active: boolean
  disabled?: boolean
  onToggle: () => void
}

// El estado no depende solo del color: la estrella se rellena y el botón anuncia aria-pressed.
export function FavoriteStar({ exerciseName, active, disabled, onToggle }: FavoriteStarProps) {
  const label = active
    ? `Quitar ${exerciseName} de favoritos`
    : `Marcar ${exerciseName} como favorito`
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      aria-label={label}
      title={active ? 'Quitar de favoritos' : 'Marcar como favorito'}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-textSecondary transition-colors hover:bg-surface hover:text-warning disabled:opacity-60"
    >
      <Star size={18} className={active ? 'fill-warning text-warning' : ''} />
    </button>
  )
}
