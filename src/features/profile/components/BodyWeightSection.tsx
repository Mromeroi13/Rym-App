import { Scale } from 'lucide-react'
import { useBodyWeightLogs } from '../hooks/useBodyWeightLogs'
import { BodyWeightChart } from './BodyWeightChart'
import { BodyWeightLogForm } from './BodyWeightLogForm'
import { BodyWeightLogList } from './BodyWeightLogList'

export function BodyWeightSection() {
  const { logs, loading, error, refresh } = useBodyWeightLogs()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-textPrimary">Peso corporal</h2>
        </div>
        <BodyWeightLogForm onSaved={refresh} />
      </div>

      <BodyWeightChart logs={logs} loading={loading} error={error} onRetry={refresh} />

      {!loading && logs.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer select-none list-none text-sm font-semibold text-textSecondary hover:text-textPrimary">
            <span className="group-open:hidden">Ver registros ({logs.length})</span>
            <span className="hidden group-open:inline">Ocultar registros</span>
          </summary>
          <div className="mt-3">
            <BodyWeightLogList logs={logs} onDeleted={refresh} />
          </div>
        </details>
      )}
    </div>
  )
}
