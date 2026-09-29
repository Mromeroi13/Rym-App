import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  UtensilsCrossed,
  TrendingUp,
  User,
  Users,
  ListChecks,
  Inbox,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'

const navItems = [
  { to: '/inicio', label: 'Inicio', icon: LayoutDashboard },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/rutinas', label: 'Rutinas', icon: Dumbbell },
  { to: '/comidas', label: 'Comidas', icon: UtensilsCrossed },
  { to: '/progreso', label: 'Progreso', icon: TrendingUp },
  { to: '/perfil', label: 'Perfil', icon: User },
]

const adminItems = [
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/ejercicios', label: 'Ejercicios', icon: ListChecks },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox },
]

function tabClasses(isActive: boolean) {
  return `flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium transition-colors ${
    isActive ? 'text-primary' : 'text-textSecondary'
  }`
}

function drawerLinkClasses(isActive: boolean) {
  return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-white font-semibold shadow-sm'
      : 'text-textSecondary hover:bg-background hover:text-textPrimary'
  }`
}

export function MobileNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <>
      {/* Barra superior móvil */}
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur-md md:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary text-white">
            <Dumbbell size={16} />
          </div>
          <span className="truncate font-heading text-sm font-semibold text-textPrimary">
            RyM App
          </span>
        </div>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="rounded-lg p-2 text-textSecondary hover:bg-background hover:text-textPrimary"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Barra de navegación inferior móvil */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex items-stretch justify-around border-t border-border bg-surface px-1 pt-1.5 md:hidden"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => tabClasses(isActive)}>
            <Icon size={20} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Menú lateral (perfil, administración y cerrar sesión) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute right-0 top-0 flex h-full w-72 max-w-[85%] flex-col justify-between bg-surface p-5 shadow-xl">
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-sm font-bold text-primary">
                    {(profile?.username ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-semibold text-textPrimary">
                      {profile?.username ?? 'Usuario'}
                    </span>
                    <span className="truncate text-xs text-textSecondary">
                      {isAdmin ? 'Admin' : 'Atleta'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="shrink-0 rounded-lg p-1.5 text-textSecondary hover:bg-background hover:text-textPrimary"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              {isAdmin && (
                <div>
                  <span className="mb-2 block px-1 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                    Administración
                  </span>
                  <div className="flex flex-col gap-1">
                    {adminItems.map(({ to, label, icon: Icon }) => (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={() => setDrawerOpen(false)}
                        className={({ isActive }) => drawerLinkClasses(isActive)}
                      >
                        <Icon size={20} className="shrink-0" />
                        <span className="truncate">{label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-textSecondary transition-colors hover:bg-background hover:text-critical"
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
