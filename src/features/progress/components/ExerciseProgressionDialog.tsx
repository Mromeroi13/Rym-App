import { Modal } from '@/components/Modal'
import { useExerciseProgression } from '../hooks/useExerciseProgression'
import { ExerciseProgressionChart } from './ExerciseProgressionChart'

interface ExerciseProgressionDialogProps {
  exerciseId: string
  exerciseName: string
  onClose: () => void
}

/**
 * Entrada de la gráfica de progresión desde fuera de la página Progreso: explorador,
 * editor de rutina y ejecución de entrenamiento (PROG-04). Es solo un diálogo por
 * encima de la pantalla actual: nunca toca el temporizador de un entrenamiento activo.
 */
export function ExerciseProgressionDialog({ exerciseId, exerciseName, onClose }: ExerciseProgressionDialogProps) {
  const { points, loading, error, refresh } = useExerciseProgression(exerciseId)

  return (
    <Modal title={exerciseName} description="Progresión de peso" onClose={onClose}>
      <ExerciseProgressionChart points={points} loading={loading} error={error} onRetry={refresh} />
    </Modal>
  )
}
