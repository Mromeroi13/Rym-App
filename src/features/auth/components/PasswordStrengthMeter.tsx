import { getPasswordStrength } from '../validation'

const LABELS = {
  empty: 'Introduce una contraseña',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Segura',
} as const

const BAR_COLORS = {
  empty: 'bg-border',
  weak: 'bg-critical',
  medium: 'bg-warning',
  strong: 'bg-success',
} as const

const TEXT_COLORS = {
  empty: 'text-textSecondary',
  weak: 'text-critical',
  medium: 'text-warning',
  strong: 'text-success',
} as const

const ACTIVE_BARS = { empty: 0, weak: 1, medium: 2, strong: 3 } as const

interface PasswordStrengthMeterProps {
  password: string
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = getPasswordStrength(password)
  const active = ACTIVE_BARS[strength]

  return (
    <div className="mt-1 flex flex-col gap-1">
      <div className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`h-1 rounded-full ${i < active ? BAR_COLORS[strength] : 'bg-border'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-textSecondary">Robustez de la contraseña</span>
        <span className={`font-semibold ${TEXT_COLORS[strength]}`}>{LABELS[strength]}</span>
      </div>
    </div>
  )
}
