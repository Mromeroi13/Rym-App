import type { ReactNode } from 'react'

// Contenedor a pantalla completa (sin sidebar) para preparar/ejecutar/revisar un entrenamiento.
export function WorkoutShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-background px-4 py-5 sm:px-6"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
    >
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  )
}
