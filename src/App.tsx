import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { AuthPage } from '@/features/auth/AuthPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { RoutinesPage } from '@/features/routines/RoutinesPage'
import { MealsPage } from '@/features/meals/MealsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { AdminUsersPage } from '@/features/admin/AdminUsersPage'
import { AdminExercisesPage } from '@/features/admin/AdminExercisesPage'
import { AdminProposalsPage } from '@/features/admin/AdminProposalsPage'

function App() {
  const { session, profile, loading } = useAuth()

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

  const isAdmin = profile?.role === 'admin'

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/rutinas" element={<RoutinesPage />} />
        <Route path="/comidas" element={<MealsPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        {isAdmin && (
          <>
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/ejercicios" element={<AdminExercisesPage />} />
            <Route path="/admin/solicitudes" element={<AdminProposalsPage />} />
          </>
        )}
        <Route path="*" element={<Navigate to="/inicio" replace />} />
      </Route>
    </Routes>
  )
}

export default App
