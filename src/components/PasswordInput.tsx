import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface PasswordInputProps {
  id: string
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  error?: string
}

export function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-textPrimary">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 text-textSecondary">
          <Lock size={18} />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded border bg-surface pl-10 pr-11 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
            error ? 'border-critical' : 'border-border'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 text-textSecondary hover:text-textPrimary"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
