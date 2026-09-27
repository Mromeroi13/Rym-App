import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Dumbbell,
  UtensilsCrossed,
  User,
  Users,
  ListChecks,
  Inbox,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/AuthProvider'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { to: '/inicio', label: 'Inicio', icon: LayoutDashboard },
  { to: '/calendario', label: 'Calendario', icon: CalendarDays },
  { to: '/rutinas', label: 'Rutinas', icon: Dumbbell },
  { to: '/comidas', label: 'Comidas', icon: UtensilsCrossed },
  { to: '/perfil', label: 'Perfil', icon: User },
]

const adminItems = [
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
  { to: '/admin/ejercicios', label: 'Ejercicios', icon: ListChecks },
  { to: '/admin/solicitudes', label: 'Solicitudes', icon: Inbox },
]

function linkClasses(isActive: boolean, collapsed: boolean) {
  return `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
    collapsed ? 'justify-center' : ''
  } ${
    isActive
      ? 'bg-primary text-white font-semibold shadow-sm'
      : 'text-textSecondary hover:bg-background hover:text-textPrimary'
  }`
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  return (
    <aside
      className={`fixed left-0 top-0 z-20 flex h-full flex-col justify-between border-r border-border bg-surface py-6 transition-all duration-200 ${
        collapsed ? 'w-20 px-2' : 'w-64 px-4'
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between px-2">
          {!collapsed && (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary text-white">
                <Dumbbell size={18} />
              </div>
              <span className="truncate font-heading text-base font-semibold text-textPrimary">
                RyM App
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="shrink-0 rounded p-1.5 text-textSecondary hover:bg-background hover:text-textPrimary"
            title="Contraer / expandir menú"
          >
            {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <nav className="mt-1 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) => linkClasses(isActive, collapsed)}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}

          {isAdmin && (
            <div className="pb-1 pt-4">
              {!collapsed && (
                <span className="mb-2 block px-2 text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  Administración
                </span>
              )}
              <div className="flex flex-col gap-1">
                {adminItems.map(({ to, label, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    title={label}
                    className={({ isActive }) => linkClasses(isActive, collapsed)}
                  >
                    <Icon size={20} className="shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <User size={18} />
          </div>
          {!collapsed && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-textPrimary">
                {profile?.username ?? 'Usuario'}
              </span>
              <span className="truncate text-xs text-textSecondary">
                {isAdmin ? 'Admin' : 'Atleta'}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-sm font-medium text-textSecondary transition-colors hover:bg-background hover:text-critical ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  )
}
