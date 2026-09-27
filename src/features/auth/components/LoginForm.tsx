import { useState, type FormEvent } from 'react'
import { Mail } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { TextField } from '@/components/TextField'
import { PasswordInput } from '@/components/PasswordInput'
import { isValidEmail } from '../validation'

interface LoginFormProps {
  onSwitchToRegister: () => void
}

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (!isValidEmail(email)) errors.email = 'Introduce un correo electrónico válido'
    if (password.length === 0) errors.password = 'Introduce tu contraseña'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setResetMessage(null)
    if (!validate()) return

    setSubmitting(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSubmitting(false)

    if (error) {
      setFormError('El correo o la contraseña no coinciden con nuestros registros.')
    }
  }

  async function handleForgotPassword() {
    setFormError(null)
    setResetMessage(null)
    if (!isValidEmail(email)) {
      setFieldErrors({ email: 'Escribe tu correo para enviarte el enlace de recuperación' })
      return
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      setFormError('No pudimos enviar el enlace de recuperación. Inténtalo de nuevo.')
    } else {
      setResetMessage(`Te hemos enviado un enlace de recuperación a ${email}.`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-textPrimary">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Accede a tus rutinas y a tu historial de entrenamiento.
        </p>
      </div>

      {formError && (
        <div className="rounded border border-critical/30 bg-critical/10 p-3 text-sm text-critical">
          {formError}
        </div>
      )}
      {resetMessage && (
        <div className="rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
          {resetMessage}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <TextField
          id="login-email"
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="tu@email.com"
          autoComplete="email"
          icon={<Mail size={18} />}
          error={fieldErrors.email}
        />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-textPrimary">Contraseña</span>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm font-medium text-primary hover:underline"
            >
              ¿Has olvidado tu contraseña?
            </button>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            error={fieldErrors.password}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-12 rounded bg-primary font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <p className="text-center text-sm text-textSecondary">
        ¿Aún no tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-semibold text-primary hover:underline"
        >
          Crear cuenta
        </button>
      </p>
    </div>
  )
}
