import { useEffect, useRef } from 'react'
import { Trophy } from 'lucide-react'

interface PRBannerProps {
  exerciseName: string
  weightKg: number
  onDismiss: () => void
}

/**
 * Banner de celebración que aparece al batir un récord personal.
 * Se auto-descarta a los 4 s o al pulsar sobre él.
 */
export function PRBanner({ exerciseName, weightKg, onDismiss }: PRBannerProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDismiss])

  return (
    <button
      type="button"
      onClick={onDismiss}
      aria-label="Cerrar notificación de récord personal"
      className="animate-tab-fade-up w-full rounded-2xl border border-warning/40 bg-warning/10 px-5 py-4 text-left shadow-lg transition-opacity active:opacity-70"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/20 text-warning">
          <Trophy size={22} fill="currentColor" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-warning">
            ¡Nuevo récord personal! 🎉
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-textPrimary">
            {exerciseName}
          </p>
          <p className="text-xs text-textSecondary">
            {weightKg.toFixed(1)} kg — mejor marca hasta ahora
          </p>
        </div>
      </div>
      {/* Barra de progreso de auto-dismiss */}
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-warning/20">
        <div
          className="h-full rounded-full bg-warning"
          style={{ animation: 'pr-progress 4s linear forwards' }}
        />
      </div>
    </button>
  )
}
