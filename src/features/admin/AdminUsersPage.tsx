import { useMemo, useState } from 'react'
import { Search, ShieldCheck, ShieldOff, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { useToast } from '@/components/toast'
import { useAdminUsers, type AdminUser } from './hooks/useAdminUsers'
import { UserChangeDialog, type UserChange } from './components/UserChangeDialog'
import { filterUsers, summarizeUsers, type UserFilter } from './userFilters'

const FILTERS: { value: UserFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'admins', label: 'Administradores' },
  { value: 'inactive', label: 'Inactivos' },
]

function tabClasses(isActive: boolean) {
  return `shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-primary text-white shadow-sm' : 'bg-background text-textSecondary hover:text-textPrimary'
  }`
}

function formatJoined(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function AdminUsersPage() {
  const { profile } = useAuth()
  const { show } = useToast()
  const { users, loading, error, refresh } = useAdminUsers()
  const [filter, setFilter] = useState<UserFilter>('all')
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<{ user: AdminUser; change: UserChange } | null>(null)

  const filtered = useMemo(() => filterUsers(users, filter, search), [users, filter, search])
  const summary = useMemo(() => summarizeUsers(users), [users])

  const actionButton =
    'inline-flex h-10 items-center gap-1.5 rounded-xl bg-background px-3 text-xs font-semibold transition-colors hover:bg-border/60 disabled:cursor-not-allowed disabled:opacity-40 sm:text-sm'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Usuarios</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Gestiona el rol y el estado de las cuentas. Siempre debe quedar al menos un administrador activo.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Cuentas', value: summary.total },
          { label: 'Activas', value: summary.active },
          { label: 'Administradores', value: summary.admins },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs font-semibold uppercase text-textSecondary">{stat.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold text-textPrimary">{loading && !users.length ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 md:p-8">
        <div className="flex flex-col gap-3">
          <div className="relative flex items-center">
            <Search size={16} className="pointer-events-none absolute left-3.5 text-textSecondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              aria-label="Buscar usuarios"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:max-w-xs"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map((f) => (
              <button key={f.value} type="button" onClick={() => setFilter(f.value)} className={tabClasses(filter === f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {loading && users.length === 0 && !error && <p className="text-sm text-textSecondary">Cargando usuarios...</p>}
          {error && (
            <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => refresh()}
                className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
              >
                Reintentar
              </button>
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <p className="rounded-xl bg-background p-4 text-sm text-textSecondary">No hay usuarios que coincidan.</p>
          )}

          {!error && filtered.length > 0 && (
            <div className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border">
              {filtered.map((user) => {
                const isSelf = user.id === profile?.id
                const isAdmin = user.role === 'admin'
                return (
                  <div
                    key={user.id}
                    className="flex flex-col gap-3 bg-surface p-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold text-primary">
                        {(user.username ?? user.email).slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-textPrimary">{user.username ?? 'Sin nombre'}</p>
                          {isSelf && <span className="text-xs text-textSecondary">(tú)</span>}
                          {isAdmin && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Admin</span>
                          )}
                          {!user.is_active && (
                            <span className="rounded-full bg-critical/10 px-2 py-0.5 text-xs font-semibold text-critical">Inactiva</span>
                          )}
                        </div>
                        <p className="truncate text-xs text-textSecondary">
                          {user.email} · alta {formatJoined(user.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={isSelf}
                        title={isSelf ? 'No puedes cambiar tu propio rol' : undefined}
                        onClick={() => setPending({ user, change: { kind: 'role', role: isAdmin ? 'user' : 'admin' } })}
                        className={`${actionButton} text-textPrimary`}
                      >
                        {isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                        {isAdmin ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                      <button
                        type="button"
                        disabled={isSelf}
                        title={isSelf ? 'No puedes desactivar tu propia cuenta' : undefined}
                        onClick={() => setPending({ user, change: { kind: 'active', isActive: !user.is_active } })}
                        className={`${actionButton} ${user.is_active ? 'text-critical' : 'text-success'}`}
                      >
                        {user.is_active ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.is_active ? 'Desactivar' : 'Reactivar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {pending && (
        <UserChangeDialog
          user={pending.user}
          change={pending.change}
          onClose={() => setPending(null)}
          onChanged={(msg) => {
            show(msg ?? 'Cambio aplicado correctamente.', 'success')
            refresh()
          }}
        />
      )}
    </div>
  )
}
