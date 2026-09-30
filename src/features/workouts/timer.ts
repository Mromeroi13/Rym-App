// Lógica pura del temporizador global (fácil de testear).

export function computeElapsed(baseSeconds: number, startedAtMs: number | null, nowMs: number): number {
  if (startedAtMs === null) return baseSeconds
  return baseSeconds + Math.max(0, Math.floor((nowMs - startedAtMs) / 1000))
}

export function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const h = Math.floor(safe / 3600)
  const m = Math.floor((safe % 3600) / 60)
  const s = safe % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

// --- Cuenta atrás (ejercicio por tiempo y descanso entre ejercicios) ---

// Igual que computeElapsed, pero restando en lugar de sumando: nunca baja de 0.
export function computeRemaining(baseSeconds: number, startedAtMs: number, nowMs: number): number {
  const elapsed = Math.max(0, Math.floor((nowMs - startedAtMs) / 1000))
  return Math.max(0, baseSeconds - elapsed)
}

// "00:30", "01:05" — mm:ss, sin horas (las cuentas atrás de esta app nunca llegan a durar una hora).
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.ceil(totalSeconds))
  const m = Math.floor(safe / 60)
  const s = safe % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
