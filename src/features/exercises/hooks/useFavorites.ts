import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/features/auth/AuthProvider'
import { addFavorite, fetchFavoriteIds, removeFavorite } from '../favoritesApi'

interface FavoritesState {
  favoriteIds: ReadonlySet<string>
  loading: boolean
  /** Error de carga o del último cambio que no se pudo guardar. */
  error: string | null
  dismissError: () => void
  isFavorite: (exerciseId: string) => boolean
  isPending: (exerciseId: string) => boolean
  toggle: (exerciseId: string) => Promise<void>
}

export function useFavorites(): FavoritesState {
  const { profile } = useAuth()
  const userId = profile?.id
  const [favoriteIds, setFavoriteIds] = useState<ReadonlySet<string>>(new Set())
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    setLoading(true)
    fetchFavoriteIds(userId)
      .then((ids) => {
        if (!cancelled) setFavoriteIds(new Set(ids))
      })
      .catch(() => {
        if (!cancelled) setError('No se pudieron cargar tus favoritos.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const toggle = useCallback(
    async (exerciseId: string) => {
      if (!userId || pending.has(exerciseId)) return
      const wasFavorite = favoriteIds.has(exerciseId)
      setError(null)
      setPending((prev) => new Set(prev).add(exerciseId))
      // Actualización optimista: se revierte si el servidor rechaza el cambio.
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorite) next.delete(exerciseId)
        else next.add(exerciseId)
        return next
      })
      try {
        if (wasFavorite) await removeFavorite(userId, exerciseId)
        else await addFavorite(userId, exerciseId)
      } catch {
        setFavoriteIds((prev) => {
          const next = new Set(prev)
          if (wasFavorite) next.add(exerciseId)
          else next.delete(exerciseId)
          return next
        })
        setError(
          wasFavorite
            ? 'No se pudo quitar el favorito. Inténtalo de nuevo.'
            : 'No se pudo guardar el favorito. Inténtalo de nuevo.',
        )
      } finally {
        setPending((prev) => {
          const next = new Set(prev)
          next.delete(exerciseId)
          return next
        })
      }
    },
    [userId, favoriteIds, pending],
  )

  return {
    favoriteIds,
    loading,
    error,
    dismissError: () => setError(null),
    isFavorite: (id) => favoriteIds.has(id),
    isPending: (id) => pending.has(id),
    toggle,
  }
}
