import { CheckCircle, Info, XCircle, X } from 'lucide-react'
import { useToast, type Toast } from './ToastContext'

const ICON: Record<Toast['type'], React.ReactNode> = {
  success: <CheckCircle size={18} className="shrink-0 text-success" />,
  error: <XCircle size={18} className="shrink-0 text-critical" />,
  info: <Info size={18} className="shrink-0 text-primary" />,
}

const BORDER: Record<Toast['type'], string> = {
  success: 'border-success/30 bg-success/10',
  error: 'border-critical/30 bg-critical/10',
  info: 'border-primary/30 bg-primary/10',
}

const TEXT: Record<Toast['type'], string> = {
  success: 'text-success',
  error: 'text-critical',
  info: 'text-primary',
}

export function ToastContainer() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div
      role="region"
      aria-label="Notificaciones"
      className="pointer-events-none fixed bottom-20 left-0 right-0 z-50 flex flex-col items-center gap-2 px-4 md:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${BORDER[toast.type]}`}
        >
          {ICON[toast.type]}
          <span className={`flex-1 text-sm font-medium ${TEXT[toast.type]}`}>{toast.message}</span>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Cerrar notificación"
            className={`rounded-lg p-0.5 transition-colors hover:bg-black/10 ${TEXT[toast.type]}`}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
