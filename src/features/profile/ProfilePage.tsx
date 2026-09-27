import { useEffect, useState, type FormEvent } from 'react'
import { Pencil, User } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { supabase } from '@/lib/supabase'
import { calculateBmi } from './bmi'

interface FieldErrors {
  username?: string
  weightKg?: string
  heightCm?: string
}

export function ProfilePage() {
  const { session, profile, refreshProfile } = useAuth()

  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [username, setUsername] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username ?? '')
      setWeightKg(profile.weight_kg !== null ? String(profile.weight_kg) : '')
      setHeightCm(profile.height_cm !== null ? String(profile.height_cm) : '')
    }
  }, [profile])

  if (!profile) {
    return (
      <div className="rounded-xl border border-border bg-surface p-8">
        <p className="text-sm text-textSecondary">Cargando perfil...</p>
      </div>
    )
  }

  function startEdit() {
    setFieldErrors({})
    setSaveError(null)
    setSuccessMessage(null)
    setMode('edit')
  }

  function cancelEdit() {
    setUsername(profile!.username ?? '')
    setWeightKg(profile!.weight_kg !== null ? String(profile!.weight_kg) : '')
    setHeightCm(profile!.height_cm !== null ? String(profile!.height_cm) : '')
    setFieldErrors({})
    setSaveError(null)
    setMode('view')
  }

  function validate(): boolean {
    const errors: FieldErrors = {}
    if (username.trim().length < 3) {
      errors.username = 'El nombre de usuario debe tener al menos 3 caracteres'
    }
    if (weightKg.trim() !== '') {
      const w = Number(weightKg)
      if (Number.isNaN(w) || w <= 0 || w > 400) {
        errors.weightKg = 'Introduce un peso válido en kg'
      }
    }
    if (heightCm.trim() !== '') {
      const h = Number(heightCm)
      if (Number.isNaN(h) || h <= 0 || h > 260) {
        errors.heightCm = 'Introduce una altura válida en cm'
      }
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function saveProfile() {
    setSaveError(null)
    setSuccessMessage(null)
    if (!validate()) return

    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.trim(),
        weight_kg: weightKg.trim() === '' ? null : Number(weightKg),
        height_cm: heightCm.trim() === '' ? null : Number(heightCm),
      })
      .eq('id', profile!.id)
    setSaving(false)

    if (error) {
      if (error.code === '23505') {
        setFieldErrors({ username: 'Ese nombre de usuario ya está en uso' })
      } else {
        setSaveError('No se pudieron guardar los cambios. Inténtalo de nuevo.')
      }
      return
    }

    await refreshProfile()
    setMode('view')
    setSuccessMessage('Cambios guardados correctamente.')
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    saveProfile()
  }

  const bmi =
    profile.weight_kg !== null && profile.height_cm !== null
      ? calculateBmi(Number(profile.weight_kg), Number(profile.height_cm))
      : null

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h1 className="font-heading text-2xl font-bold text-textPrimary">Perfil</h1>
        <p className="mt-1 text-sm text-textSecondary">
          Gestiona tus datos personales y biométricos.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-success/70 hover:text-success"
          >
            ✕
          </button>
        </div>
      )}
      {saveError && (
        <div className="flex items-center justify-between rounded-xl border border-critical/30 bg-critical/10 p-4 text-sm text-critical">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={() => saveProfile()}
            className="rounded-lg bg-surface px-3 py-1 text-xs font-semibold text-critical hover:bg-critical/10"
          >
            Reintentar
          </button>
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="flex flex-col items-start justify-between gap-4 border-b border-border pb-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background text-lg font-bold text-primary">
              {(profile.username ?? 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-textPrimary">
                {profile.username ?? 'Usuario'}
              </h2>
              <p className="text-sm text-textSecondary">{session?.user.email}</p>
            </div>
          </div>

          {mode === 'view' ? (
            <button
              type="button"
              onClick={startEdit}
              className="inline-flex items-center gap-2 rounded-xl bg-background px-4 py-2.5 text-sm font-semibold text-textPrimary transition-colors hover:bg-border/60"
            >
              <Pencil size={16} />
              Editar perfil
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl bg-background px-4 py-2.5 text-sm font-medium text-textSecondary hover:bg-border/60"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={saving}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          )}
        </div>

        {bmi && (
          <div className="mt-6 grid grid-cols-1 gap-4 rounded-xl bg-background p-4 sm:grid-cols-4">
            <div>
              <span className="text-xs font-semibold uppercase text-textSecondary">Índice IMC</span>
              <p className="mt-0.5 font-heading text-lg font-bold text-textPrimary">
                {bmi.value} <span className="text-sm font-normal text-textSecondary">{bmi.category}</span>
              </p>
            </div>
          </div>
        )}

        <form id="profile-form" onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-textPrimary">Nombre de usuario</label>
              {mode === 'view' ? (
                <div className="flex h-11 items-center rounded-xl bg-background px-3.5 text-sm font-medium text-textPrimary">
                  {profile.username ?? '—'}
                </div>
              ) : (
                <div>
                  <div className="relative flex items-center">
                    <User size={16} className="pointer-events-none absolute left-3 text-textSecondary" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={`h-11 w-full rounded-xl border bg-surface pl-9 pr-3.5 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                        fieldErrors.username ? 'border-critical' : 'border-border'
                      }`}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="mt-1 text-xs text-critical">{fieldErrors.username}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-textPrimary">Correo electrónico</label>
              <div className="flex h-11 cursor-not-allowed items-center justify-between rounded-xl bg-background px-3.5 text-sm text-textSecondary">
                <span className="truncate">{session?.user.email}</span>
                <span className="ml-2 shrink-0 text-xs">No editable</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-textPrimary">Peso corporal (kg)</label>
              {mode === 'view' ? (
                <div className="flex h-11 items-center justify-between rounded-xl bg-background px-3.5 text-sm font-medium text-textPrimary">
                  <span>{profile.weight_kg !== null ? profile.weight_kg : '—'}</span>
                  {profile.weight_kg !== null && <span className="text-xs text-textSecondary">kg</span>}
                </div>
              ) : (
                <div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      placeholder="78.4"
                      className={`h-11 w-full rounded-xl border bg-surface px-3.5 pr-10 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                        fieldErrors.weightKg ? 'border-critical' : 'border-border'
                      }`}
                    />
                    <span className="absolute right-3.5 text-xs font-semibold text-textSecondary">kg</span>
                  </div>
                  {fieldErrors.weightKg && (
                    <p className="mt-1 text-xs text-critical">{fieldErrors.weightKg}</p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-textPrimary">Altura (cm)</label>
              {mode === 'view' ? (
                <div className="flex h-11 items-center justify-between rounded-xl bg-background px-3.5 text-sm font-medium text-textPrimary">
                  <span>{profile.height_cm !== null ? profile.height_cm : '—'}</span>
                  {profile.height_cm !== null && <span className="text-xs text-textSecondary">cm</span>}
                </div>
              ) : (
                <div>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      step="1"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      placeholder="182"
                      className={`h-11 w-full rounded-xl border bg-surface px-3.5 pr-10 text-sm text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
                        fieldErrors.heightCm ? 'border-critical' : 'border-border'
                      }`}
                    />
                    <span className="absolute right-3.5 text-xs font-semibold text-textSecondary">cm</span>
                  </div>
                  {fieldErrors.heightCm && (
                    <p className="mt-1 text-xs text-critical">{fieldErrors.heightCm}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
