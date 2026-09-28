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
