import { addDaysKey, todayKey } from '@/utils/dates'

export interface StreakResult {
  /** Días consecutivos de entrenamiento hasta hoy (o hasta ayer si hoy aún no se ha entrenado). */
  current: number
  /** Mejor racha registrada en todo el historial. */
  best: number
  /** true si el usuario ya entrenó hoy. */
  trainedToday: boolean
}

/**
 * Calcula la racha actual y la mejor histórica a partir del conjunto de fechas
 * en que el usuario completó al menos un entrenamiento.
 */
export function computeStreak(completedDates: Set<string>): StreakResult {
  if (completedDates.size === 0) return { current: 0, best: 0, trainedToday: false }

  const today = todayKey()
  const trainedToday = completedDates.has(today)

  // Racha actual: retroceder desde hoy (o ayer si hoy no se ha entrenado)
  let current = 0
  let cursor = trainedToday ? today : addDaysKey(today, -1)
  while (completedDates.has(cursor)) {
    current++
    cursor = addDaysKey(cursor, -1)
  }

  // Mejor racha: recorrer todas las fechas ordenadas
  const sorted = [...completedDates].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const date of sorted) {
    if (prev && date === addDaysKey(prev, 1)) {
      run++
    } else {
      run = 1
    }
    if (run > best) best = run
    prev = date
  }

  return { current, best, trainedToday }
}
