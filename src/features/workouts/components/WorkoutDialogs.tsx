import { Modal } from '@/components/Modal'

interface ExitWorkoutDialogProps {
  timerEnabled: boolean
  busy: boolean
  error: string | null
  onContinue: () => void
  onSaveAndExit: () => void
  onAbandon: () => void
}

export function ExitWorkoutDialog({ timerEnabled, busy, error, onContinue, onSaveAndExit, onAbandon }: ExitWorkoutDialogProps) {
  return (
    <Modal
      title="¿Salir del entrenamiento?"
      description="Las series que ya completaste están guardadas. Elige qué hacer con el resto de la sesión."
      onClose={onContinue}
    >
      <div className="flex flex-col gap-3">
        {error && <p className="text-sm text-critical">{error}</p>}
        <button
          type="button"
          onClick={onContinue}
          disabled={busy}
          className="h-14 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          Continuar entrenando
        </button>
        <button
          type="button"
          onClick={onSaveAndExit}
          disabled={busy}
          className="h-14 rounded-xl bg-background px-4 text-sm font-semibold text-textPrimary hover:bg-border/60 disabled:opacity-60"
        >
          Salir y continuar después
          <span className="block text-xs font-normal text-textSecondary">
            {timerEnabled ? 'El temporizador queda en pausa.' : 'Podrás retomarlo desde Rutinas.'}
          </span>
        </button>
        <button
          type="button"
          onClick={onAbandon}
          disabled={busy}
          className="h-14 rounded-xl px-4 text-sm font-semibold text-critical hover:bg-critical/10 disabled:opacity-60"
        >
          Abandonar entrenamiento
          <span className="block text-xs font-normal text-textSecondary">
            Se cierra la sesión; quedarán solo las series ya completadas.
          </span>
        </button>
      </div>
    </Modal>
  )
}

interface FinishWorkoutDialogProps {
  pendingSets: number
  busy: boolean
  error: string | null
  onCancel: () => void
  onConfirm: () => void
}

export function FinishWorkoutDialog({ pendingSets, busy, error, onCancel, onConfirm }: FinishWorkoutDialogProps) {
  return (
    <Modal
      title="Finalizar entrenamiento"
      description={
        pendingSets > 0
          ? `Quedan ${pendingSets} ${pendingSets === 1 ? 'serie' : 'series'} sin completar. Se guardarán sin valores reales.`
          : 'Has completado todas las series. Se guardará en tu historial.'
      }
      onClose={onCancel}
    >
      {error && <p className="mb-3 text-sm text-critical">{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row-reverse">
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="h-14 flex-1 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? 'Guardando...' : 'Finalizar y guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-14 flex-1 rounded-xl bg-background px-4 text-sm font-semibold text-textSecondary hover:bg-border/60 disabled:opacity-60"
        >
          Seguir entrenando
        </button>
      </div>
    </Modal>
  )
}
