import { useSession } from '@/features/auth/hooks/useSession'
import { AuthPage } from '@/features/auth/AuthPage'
import { supabase } from '@/lib/supabase'

function App() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-textSecondary">Cargando...</p>
      </div>
    )
  }

  if (!session) {
    return <AuthPage />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-sm text-textSecondary">
        Sesión iniciada como{' '}
        <span className="font-semibold text-textPrimary">{session.user.email}</span>
      </p>
      <button
        type="button"
        onClick={() => supabase.auth.signOut()}
        className="rounded border border-border px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-surface"
      >
        Cerrar sesión
      </button>
      <p className="max-w-sm text-xs text-textSecondary">
        Próxima pantalla: navegación principal (Inicio, Calendario, Rutinas, Comidas, Perfil).
      </p>
    </div>
  )
}

export default App
