import { useState } from 'react'
import { ImageOff } from 'lucide-react'
import { Modal } from '@/components/Modal'

interface ExerciseGifModalProps {
  exerciseName: string
  gifUrl: string | null
  onClose: () => void
}

/**
 * Modal de "cómo se realiza" un ejercicio. Se usa tanto en el editor de rutinas
 * como durante la ejecución de un entrenamiento (RT y WK reutilizan este mismo
 * componente, ver docs/FEATURES.md). Es puramente de presentación: abrir/cerrar
 * no debe leer ni escribir ningún estado de rutina o entrenamiento.
 */
export function ExerciseGifModal({ exerciseName, gifUrl, onClose }: ExerciseGifModalProps) {
  const [loadFailed, setLoadFailed] = useState(false)
  const showEmptyState = !gifUrl || loadFailed

  return (
    <Modal title={exerciseName} description="Cómo se realiza" onClose={onClose}>
      {showEmptyState ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl bg-background p-10 text-center">
          <ImageOff size={28} className="text-textSecondary" />
          <p className="text-sm text-textSecondary">No hay demostración disponible para este ejercicio.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-background">
          <img
            src={gifUrl}
            alt={`Demostración: ${exerciseName}`}
            className="mx-auto max-h-[60vh] w-full object-contain"
            onError={() => setLoadFailed(true)}
          />
        </div>
      )}
    </Modal>
  )
}
