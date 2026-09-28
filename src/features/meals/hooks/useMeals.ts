import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchMeals, type MealRow } from '../mealApi'

interface MealsState {
  // Solo contiene comidas del rango pedido (vacío mientras carga un rango nuevo).
  meals: MealRow[]
  // true cuando `meals` ya corresponde al rango actual (al menos una carga correcta).
  ready: boolean
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// rangeStart / rangeEnd: 'YYYY-MM-DD' (ambos incluidos)
export function useMeals(rangeStart: string, rangeEnd: string): MealsState {
  const key = `${rangeStart}|${rangeEnd}`
  const [data, setData] = useState<{ key: string; meals: MealRow[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const meals = await fetchMeals(rangeStart, rangeEnd)
      if (id !== requestId.current) return // llegó una petición más reciente
      setData({ key: `${rangeStart}|${rangeEnd}`, meals })
    } catch {
      if (id !== requestId.current) return
      setError('No se pudieron cargar tus comidas.')
    }
    setLoading(false)
  }, [rangeStart, rangeEnd])

  useEffect(() => {
    load()
  }, [load])

  const ready = data?.key === key
  return {
    meals: ready && data ? data.meals : [],
    ready,
    loading: loading || !ready,
    error,
    refresh: load,
  }
}
