import { useCallback, useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

/** Número de propuestas de ejercicios pendientes de revisión para administradores. */
export function usePendingProposalsCount(enabled: boolean) {
  const [count, setCount] = useState(0)
  const location = useLocation()

  const refresh = useCallback(async () => {
    if (!enabled) {
      setCount(0)
      return
    }

    const { count: pendingCount, error } = await supabase
      .from('exercise_proposals')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')

    if (!error) setCount(pendingCount ?? 0)
  }, [enabled])

  useEffect(() => {
    if (!enabled) {
      setCount(0)
      return
    }

    void refresh()

    // Sidebar y MobileNav usan este hook a la vez. Cada efecto necesita
    // un canal propio para evitar reutilizar uno que ya esté suscrito
    // (también ocurre durante el montaje doble de React StrictMode).
    const channelId = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const channel = supabase
      .channel(`admin-pending-exercise-proposals-count-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'exercise_proposals' },
        () => void refresh(),
      )
      .subscribe()

    const handleFocus = () => void refresh()
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
      void supabase.removeChannel(channel)
    }
  }, [enabled, refresh, location.pathname])

  return count
}
