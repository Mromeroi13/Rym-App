import { createContext, useContext, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useSession } from './hooks/useSession'
import { useProfile, type Profile } from '@/features/profile/hooks/useProfile'

interface AuthContextValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession()
  const { profile, loading: profileLoading, refresh } = useProfile(session?.user.id)

  const value: AuthContextValue = {
    session,
    profile,
    loading: sessionLoading || (!!session && profileLoading),
    refreshProfile: refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return ctx
}
