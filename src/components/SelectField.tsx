interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Selecciona una opción',
  error,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-semibold text-textPrimary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-12 w-full rounded border bg-surface px-3.5 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
          error ? 'border-critical' : 'border-border'
        } ${value === '' ? 'text-textSecondary' : ''}`}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-textPrimary">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-critical">{error}</p>}
    </div>
  )
}
