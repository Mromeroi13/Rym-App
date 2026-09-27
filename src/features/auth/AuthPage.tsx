import { useState } from 'react'
import { Dumbbell } from 'lucide-react'
import { LoginForm } from './components/LoginForm'
import { RegisterForm } from './components/RegisterForm'

type Tab = 'login' | 'register'

export function AuthPage() {
  const [tab, setTab] = useState<Tab>('login')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-10">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-white">
          <Dumbbell size={18} />
        </div>
        <span className="font-heading text-lg font-semibold text-textPrimary">RyM App</span>
      </div>

      <div className="w-full max-w-[420px] overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="h-1 w-full bg-primary" />
        <div className="p-6 md:p-8">
          <div className="mb-6 flex rounded-lg bg-background p-1">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === 'login' ? 'bg-surface text-textPrimary shadow-sm' : 'text-textSecondary'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
                tab === 'register' ? 'bg-surface text-textPrimary shadow-sm' : 'text-textSecondary'
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {tab === 'login' ? (
            <LoginForm onSwitchToRegister={() => setTab('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setTab('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
