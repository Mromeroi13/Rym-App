import type { ReactNode } from 'react'

interface TextFieldProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoComplete?: string
  icon?: ReactNode
  error?: string
}

export function TextField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  error,
}: TextFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-textPrimary">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="pointer-events-none absolute left-3 text-textSecondary">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`h-12 w-full rounded border bg-surface px-3.5 text-sm text-textPrimary placeholder:text-textSecondary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
            icon ? 'pl-10' : ''
          } ${error ? 'border-critical' : 'border-border'}`}
        />
      </div>
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
