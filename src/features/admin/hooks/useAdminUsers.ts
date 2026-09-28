import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppRole } from '@/types/database.types'

export interface AdminUser {
  id: string
  username: string | null
  email: string
  role: AppRole
  is_active: boolean
  created_at: string
}

interface AdminUsersState {
  users: AdminUser[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

// Usa la RPC admin_list_users (solo admins): el email vive en auth.users y no es accesible desde el cliente.
export function useAdminUsers(): AdminUsersState {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: rpcError } = await supabase.rpc('admin_list_users')
    if (rpcError) {
      setError('No se pudieron cargar los usuarios.')
    } else {
      setUsers((data ?? []) as AdminUser[])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return { users, loading, error, refresh: load }
}
