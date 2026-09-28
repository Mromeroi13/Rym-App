import { useState } from 'react'
import { Modal } from '@/components/Modal'
import { supabase } from '@/lib/supabase'
import type { AppRole } from '@/types/database.types'
import type { AdminUser } from '../hooks/useAdminUsers'

export type UserChange = { kind: 'role'; role: AppRole } | { kind: 'active'; isActive: boolean }

interface UserChangeDialogProps {
  user: AdminUser
  change: UserChange
  onClose: () => void
  onChanged: () => void
}

function describe(user: AdminUser, change: UserChange) {
  const name = user.username ?? user.email
  if (change.kind === 'role') {
    return change.role === 'admin'
      ? {
          title: 'Dar permisos de administrador',
          text: `${name} podrá gestionar usuarios, el catálogo oficial y las solicitudes, además de usar la app con normalidad.`,
          action: 'Hacer administrador',
          danger: false,
        }
      : {
          title: 'Quitar permisos de administrador',
          text: `${name} pasará a ser un usuario normal y perderá acceso a la sección de Administración.`,
          action: 'Quitar permisos',
          danger: true,
        }
  }
  return change.isActive
    ? {
        title: 'Reactivar cuenta',
        text: `${name} volverá a poder usar la app y ver sus datos.`,
        action: 'Reactivar',
        danger: false,
      }
    : {
        title: 'Desactivar cuenta',
        text: `${name} no podrá acceder a sus rutinas, entrenamientos ni comidas mientras esté desactivada. No se borra ningún dato y podrás reactivarla.`,
        action: 'Desactivar',
        danger: true,
      }
}

export function UserChangeDialog({ user, change, onClose, onChanged }: UserChangeDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = describe(user, change)

  async function confirm() {
    setSaving(true)
    setError(null)
    const patch = change.kind === 'role' ? { role: change.role } : { is_active: change.isActive }
    // .select() permite detectar el caso "0 filas afectadas" (RLS que deniega sin error).
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id)
      .select('id')
    setSaving(false)

    if (updateError) {
      setError(
        updateError.message.includes('al menos un administrador')
          ? 'Debe quedar al menos un administrador activo.'
          : 'No se pudo aplicar el cambio. Inténtalo de nuevo.',
      )
      return
    }
    if (!data || data.length === 0) {
      setError('No tienes permiso para realizar este cambio.')
      return
    }
    onChanged()
    onClose()
  }

  return (
    <Modal title={copy.title} description={copy.text} onClose={onClose}>
      {error && <p className="mb-3 text-sm text-critical">{error}</p>}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="h-11 rounded-xl bg-background px-4 text-sm font-medium text-textSecondary hover:bg-border/60 disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirm}
          disabled={saving}
          className={`h-11 rounded-xl px-5 text-sm font-semibold text-white shadow-sm disabled:opacity-60 ${
            copy.danger ? 'bg-critical hover:bg-critical/90' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {saving ? 'Guardando...' : copy.action}
        </button>
      </div>
    </Modal>
  )
}
