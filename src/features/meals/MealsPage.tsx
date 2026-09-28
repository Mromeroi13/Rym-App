import { useCallback, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Info } from 'lucide-react'
import type { MealType } from '@/types/database.types'
import { useAuth } from '@/features/auth/AuthProvider'
import { addDaysKey, formatLongDate, parseDateKey, todayKey } from '@/utils/dates'
import { deleteMeal, saveMeal } from './mealApi'
import { useMeals } from './hooks/useMeals'
import { MealSlotCard } from './components/MealSlotCard'
import { MEAL_SLOT_COUNT, buildDaySlots, countLogged } from './mealSlots'

const RECENT_DAYS = 7

function shortDayLabel(key: string, today: string): string {
  if (key === today) return 'Hoy'
  if (key === addDaysKey(today, -1)) return 'Ayer'
  return parseDateKey(key).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
}

export function MealsPage() {
  const { profile } = useAuth()
  const today = todayKey()
  const [selectedDate, setSelectedDate] = useState(today)

  const day = useMeals(selectedDate, selectedDate)
  const recentStart = addDaysKey(today, -(RECENT_DAYS - 1))
  const recent = useMeals(recentStart, today)

  // Tramos con texto escrito y aún sin guardar (para no perderlo al cambiar de día).
  const dirtyTypes = useRef(new Set<MealType>())
  const handleDirtyChange = useCallback((type: MealType, dirty: boolean) => {
    if (dirty) dirtyTypes.current.add(type)
    else dirtyTypes.current.delete(type)
  }, [])

  function goToDate(key: string) {
    if (!key || key === selectedDate) return
    if (dirtyTypes.current.size > 0 && !window.confirm('Tienes cambios sin guardar. ¿Seguro que quieres cambiar de día?')) {
      return
    }
    dirtyTypes.current.clear()
    setSelectedDate(key)
  }

  const slots = useMemo(() => buildDaySlots(day.meals), [day.meals])
  const loggedCount = countLogged(day.meals)
  const percent = Math.round((loggedCount / MEAL_SLOT_COUNT) * 100)

  const recentDays = useMemo(
    () =>
      Array.from({ length: RECENT_DAYS }, (_, i) => {
        const key = addDaysKey(today, -i)
        return { key, logged: countLogged(recent.meals.filter((m) => m.meal_date === key)) }
      }),
    [recent.meals, today],
  )

  async function refreshAll() {
    await Promise.all([day.refresh(), recent.refresh()])
  }

  async function handleSave(type: MealType, description: string): Promise<string | null> {
    if (!profile) return 'No se pudo identificar tu cuenta. Vuelve a iniciar sesión.'
    try {
      await saveMeal(profile.id, selectedDate, type, description)
    } catch {
      return 'No se pudo guardar la comida. Inténtalo de nuevo.'
    }
    await refreshAll()
    return null
  }

  async function handleDelete(id: string): Promise<string | null> {
    try {
      await deleteMeal(id)
    } catch {
      return 'No se pudo borrar la comida. Inténtalo de nuevo.'
    }
    await refreshAll()
    return null
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Comidas</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Registra en una frase cada una de tus cinco comidas del día.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          {/* Navegación por días */}
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => goToDate(addDaysKey(selectedDate, -1))}
                aria-label="Día anterior"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-textSecondary hover:bg-background"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => goToDate(addDaysKey(selectedDate, 1))}
                aria-label="Día siguiente"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-textSecondary hover:bg-background"
              >
                <ChevronRight size={20} />
              </button>
              <div className="ml-2 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">
                  {selectedDate === today ? 'Hoy' : 'Día seleccionado'}
                </p>
                <p className="truncate font-heading text-base font-bold capitalize text-textPrimary">
                  {formatLongDate(selectedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="meal-date" className="sr-only">
                Ir a una fecha
              </label>
              <input
                id="meal-date"
                type="date"
                value={selectedDate}
                onChange={(e) => goToDate(e.target.value)}
                className="h-11 rounded-xl border border-border bg-surface px-3 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {selectedDate !== today && (
                <button
                  type="button"
                  onClick={() => goToDate(today)}
                  className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-background px-3.5 text-sm font-semibold text-primary hover:bg-primary/10"
                >
                  <CalendarDays size={16} /> Hoy
                </button>
              )}
            </div>
          </div>

          {/* Progreso del día */}
          <div className="rounded-xl border border-border bg-surface p-4 md:p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-textPrimary">
                {loggedCount} de {MEAL_SLOT_COUNT} comidas registradas
              </span>
              <span className="text-textSecondary">{percent}%</span>
            </div>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-background"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={MEAL_SLOT_COUNT}
              aria-valuenow={loggedCount}
            >
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
            </div>
          </div>

          {day.error && (
            <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
              <span>{day.error}</span>
              <button
                type="button"
                onClick={() => day.refresh()}
                className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
              >
                Reintentar
              </button>
            </div>
          )}

          {!day.ready && !day.error ? (
            <p className="text-sm text-textSecondary">Cargando comidas...</p>
          ) : (
            !day.error && (
              <div className={`flex flex-col gap-3 ${day.loading ? 'opacity-60' : ''}`}>
                {slots.map((slot, index) => (
                  <MealSlotCard
                    // El estado de edición no debe arrastrarse de un día a otro.
                    key={`${selectedDate}-${slot.type}`}
                    position={index + 1}
                    type={slot.type}
                    label={slot.label}
                    meal={slot.meal}
                    onSave={(description) => handleSave(slot.type, description)}
                    onDelete={() => (slot.meal ? handleDelete(slot.meal.id) : Promise.resolve(null))}
                    onDirtyChange={handleDirtyChange}
                  />
                ))}
              </div>
            )
          )}
        </div>

        <div className="flex h-fit flex-col gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textSecondary">Historial reciente</span>
            {recent.error ? (
              <p className="mt-3 text-sm text-critical">{recent.error}</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-1.5">
                {recentDays.map(({ key, logged }) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => goToDate(key)}
                      className={`flex min-h-[2.75rem] w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        key === selectedDate ? 'bg-primary/10 font-semibold text-primary' : 'text-textPrimary hover:bg-background'
                      }`}
                    >
                      <span className="truncate capitalize">{shortDayLabel(key, today)}</span>
                      <span className="flex shrink-0 items-center gap-1 text-xs">
                        <span className={logged === MEAL_SLOT_COUNT ? 'text-success' : 'text-textSecondary'}>
                          {logged} de {MEAL_SLOT_COUNT}
                        </span>
                        <ChevronRight size={14} className="text-textSecondary" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-border bg-background p-5">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-textPrimary">
              <Info size={16} className="text-primary" /> Registro ágil
            </p>
            <p className="mt-2 text-sm text-textSecondary">
              Una frase por comida es suficiente. Aquí no se cuentan calorías ni gramos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
