// Filtrado y orden del selector de ejercicios (RT-08). Lógica pura y testeable.

export interface PickerExercise {
  id: string
  name: string
  muscle_group_id: string
}

export interface PickerFilters {
  groupId: string | null
  search: string
  favoritesOnly: boolean
}

/**
 * Aplica búsqueda, grupo muscular y filtro de favoritos (se combinan). En la vista sin
 * filtro de favoritos, los favoritos van primero; dentro de cada bloque se conserva el
 * orden recibido (alfabético).
 */
export function filterPickerExercises<T extends PickerExercise>(
  exercises: readonly T[],
  favoriteIds: ReadonlySet<string>,
  filters: PickerFilters,
): T[] {
  const term = filters.search.trim().toLowerCase()
  const matches = exercises.filter(
    (e) =>
      (!filters.groupId || e.muscle_group_id === filters.groupId) &&
      (!filters.favoritesOnly || favoriteIds.has(e.id)) &&
      e.name.toLowerCase().includes(term),
  )
  if (filters.favoritesOnly) return matches
  return [...matches.filter((e) => favoriteIds.has(e.id)), ...matches.filter((e) => !favoriteIds.has(e.id))]
}
