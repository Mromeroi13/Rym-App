import { useState, type FormEvent } from 'react'
import { Mail, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { TextField } from '@/components/TextField'
import { PasswordInput } from '@/components/PasswordInput'
import { PasswordStrengthMeter } from './PasswordStrengthMeter'
import { isValidEmail } from '../validation'

interface RegisterFormProps {
  onSwitchToLogin: () => void
}

interface FieldErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (username.trim().length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    }
    if (!isValidEmail(email)) {
      errors.email = 'Introduce una dirección de correo válida'
    }
    if (password.length < 8) {
      errors.password = 'La contraseña debe tener al menos 8 caracteres'
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = 'Las contraseñas no coinciden'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSuccessMessage(null)
    if (!validate()) return

    setSubmitting(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })
    setSubmitting(false)

    if (error) {
      setFormError(
        error.message.toLowerCase().includes('already registered')
          ? 'Ya existe una cuenta con ese correo.'
          : 'No se pudo completar el registro. Puede que el correo o el usuario ya estén en uso.',
      )
      return
    }

    setSuccessMessage('Cuenta creada. Revisa tu correo para confirmarla antes de iniciar sesión.')
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-textPrimary">Crear cuenta</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Empieza a planificar y registrar tus entrenamientos.
        </p>
      </div>

      {formError && (
        <div className="rounded border border-critical/30 bg-critical/10 p-3 text-sm text-critical">
          {formError}
        </div>
      )}
      {successMessage && (
        <div className="rounded border border-success/30 bg-success/10 p-3 text-sm text-success">
          {successMessage}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <TextField
          id="reg-username"
          label="Nombre de usuario"
          value={username}
          onChange={setUsername}
          placeholder="marcos_silva"
          autoComplete="username"
          icon={<User size={18} />}
          error={fieldErrors.username}
        />

        <TextField
          id="reg-email"
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
          <PasswordInput
            id="reg-password"
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            error={fieldErrors.password}
          />
          <PasswordStrengthMeter password={password} />
        </div>

        <PasswordInput
          id="reg-confirm"
          label="Confirmar contraseña"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          error={fieldErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 h-12 rounded bg-primary font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-textSecondary">
        ¿Ya tienes cuenta?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-primary hover:underline"
        >
          Iniciar sesión
        </button>
      </p>
    </div>
  )
}
