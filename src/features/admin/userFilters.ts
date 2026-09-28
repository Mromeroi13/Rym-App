import type { AppRole } from '@/types/database.types'

export interface AdminUserLike {
  id: string
  username: string | null
  email: string
  role: AppRole
  is_active: boolean
}

export type UserFilter = 'all' | 'admins' | 'inactive'

export function filterUsers<T extends AdminUserLike>(users: readonly T[], filter: UserFilter, search: string): T[] {
  const query = search.trim().toLowerCase()
  return users.filter((u) => {
    if (filter === 'admins' && u.role !== 'admin') return false
    if (filter === 'inactive' && u.is_active) return false
    if (!query) return true
    return (u.username ?? '').toLowerCase().includes(query) || u.email.toLowerCase().includes(query)
  })
}

export function summarizeUsers(users: readonly AdminUserLike[]) {
  return {
    total: users.length,
    active: users.filter((u) => u.is_active).length,
    admins: users.filter((u) => u.role === 'admin' && u.is_active).length,
  }
}
