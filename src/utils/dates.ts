// Las fechas de calendario (columna `date` de Postgres) se manejan como 'YYYY-MM-DD'
// en hora local, para evitar desfases por zona horaria.

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Suma (o resta) días a una fecha 'YYYY-MM-DD' en hora local (seguro ante cambios de horario).
export function addDaysKey(key: string, days: number): string {
  const d = parseDateKey(key)
  d.setDate(d.getDate() + days)
  return toDateKey(d)
}

export function formatLongDate(key: string): string {
  return parseDateKey(key).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Devuelve las celdas (semanas completas, lunes primero) que cubren el mes indicado.
export function buildMonthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks = Math.ceil((offset + daysInMonth) / 7)
  return Array.from({ length: weeks * 7 }, (_, i) => new Date(year, month, 1 - offset + i))
}
