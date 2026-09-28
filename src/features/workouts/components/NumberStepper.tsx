import { Minus, Plus } from 'lucide-react'
import { formatNumber } from '../workoutUtils'

interface NumberStepperProps {
  id: string
  label: string
  unit: string
  value: string
  step: number
  inputMode: 'decimal' | 'numeric'
  disabled?: boolean
  onChange: (value: string) => void
}

// Controles grandes (mín. 56 px) pensados para usar con una mano durante el entrenamiento.
export function NumberStepper({ id, label, unit, value, step, inputMode, disabled, onChange }: NumberStepperProps) {
  function bump(direction: -1 | 1) {
    const current = Number(value) || 0
    onChange(formatNumber(Math.max(0, current + direction * step)))
  }

  const buttonClasses =
    'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-background text-textPrimary transition-colors hover:bg-border/60 active:bg-border disabled:opacity-40'

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-textSecondary">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => bump(-1)} disabled={disabled} aria-label={`Restar a ${label}`} className={buttonClasses}>
          <Minus size={20} />
        </button>
        <div className="relative min-w-0 flex-1">
          <input
            id={id}
            type="number"
            inputMode={inputMode}
            step={step}
            min="0"
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="h-14 w-full rounded-xl border border-border bg-surface px-3 pr-12 text-center font-heading text-xl font-bold text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-textSecondary">
            {unit}
          </span>
        </div>
        <button type="button" onClick={() => bump(1)} disabled={disabled} aria-label={`Sumar a ${label}`} className={buttonClasses}>
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
