import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthProvider'
import { AuthPage } from '@/features/auth/AuthPage'
import { AppLayout } from '@/components/layout/AppLayout'
import { HomePage } from '@/features/home/HomePage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { RoutinesPage } from '@/features/routines/RoutinesPage'
import { RoutineEditorPage } from '@/features/routines/RoutineEditorPage'
import { MealsPage } from '@/features/meals/MealsPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { WorkoutPage } from '@/features/workouts/WorkoutPage'
import { WorkoutPreparePage } from '@/features/workouts/WorkoutPreparePage'
import { WorkoutHistoryPage } from '@/features/workouts/WorkoutHistoryPage'
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
      {/* Preparación y ejecución a pantalla completa (sin sidebar) */}
      <Route path="/entrenamiento/iniciar/:routineId" element={<WorkoutPreparePage />} />
      <Route path="/entrenamiento/:sessionId" element={<WorkoutPage />} />
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/inicio" replace />} />
        <Route path="/inicio" element={<HomePage />} />
        <Route path="/calendario" element={<CalendarPage />} />
        <Route path="/rutinas" element={<RoutinesPage />} />
        <Route path="/entrenamientos" element={<WorkoutHistoryPage />} />
        <Route path="/rutinas/nueva" element={<RoutineEditorPage />} />
        <Route path="/rutinas/:routineId/editar" element={<RoutineEditorPage />} />
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
