import type { MealType } from '@/types/database.types'

// Exactamente cinco tramos por día, en este orden (docs/PRODUCT.md §4 — Meals).
export const MEAL_SLOTS: readonly { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Desayuno' },
  { type: 'snack', label: 'Snack' },
  { type: 'lunch', label: 'Almuerzo' },
  { type: 'afternoon_snack', label: 'Merienda' },
  { type: 'dinner', label: 'Cena' },
]

export const MEAL_SLOT_COUNT = MEAL_SLOTS.length
export const MAX_MEAL_DESCRIPTION = 200

export interface MealLike {
  id: string
  meal_type: MealType
  description: string | null
}

export interface DaySlot<T extends MealLike> {
  type: MealType
  label: string
  meal: T | null
}

// Un tramo cuenta como "registrado" solo si tiene texto.
export function isLogged(meal: MealLike | null | undefined): boolean {
  return !!meal && (meal.description ?? '').trim().length > 0
}

// Siempre devuelve los cinco tramos, aunque no haya registros ese día.
export function buildDaySlots<T extends MealLike>(meals: readonly T[]): DaySlot<T>[] {
  return MEAL_SLOTS.map((slot) => ({
    ...slot,
    meal: meals.find((m) => m.meal_type === slot.type) ?? null,
  }))
}

export function countLogged(meals: readonly MealLike[]): number {
  return MEAL_SLOTS.filter((slot) => isLogged(meals.find((m) => m.meal_type === slot.type))).length
}

// Devuelve el mensaje de error, o null si la descripción es válida.
export function validateMealDescription(text: string): string | null {
  const trimmed = text.trim()
  if (trimmed.length === 0) return 'Escribe qué has comido.'
  if (trimmed.length > MAX_MEAL_DESCRIPTION) {
    return `Máximo ${MAX_MEAL_DESCRIPTION} caracteres (llevas ${trimmed.length}).`
  }
  return null
}
