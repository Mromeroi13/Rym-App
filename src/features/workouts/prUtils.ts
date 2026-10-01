/**
 * Devuelve true si el peso registrado supera el récord histórico previo.
 * Si no hay historial previo (primera vez entrenando ese ejercicio con peso),
 * también se considera PR para celebrarlo.
 */
export function isPR(actualWeightKg: number | null, previousBest: number | null): boolean {
  if (actualWeightKg === null || actualWeightKg <= 0) return false
  if (previousBest === null) return true          // primera marca registrada
  return actualWeightKg > previousBest
}
