import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import {
  loadDriverCustodyView,
  formatDriverCustodyAmount,
} from '../../api/driverCustody.js'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض عهدة السائق.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

function formatCustodyDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ar-LY', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DriverCustodyViewSection({ driver, onCustodyLoaded }) {
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const custodyBalance = view?.custodyBalance ?? driver?.custodyBalance ?? 0
  const pendingCash = view?.pendingCash ?? driver?.pendingCash ?? 0
  const isBlocked = view?.isBlockedFromCod ?? driver?.isBlockedFromCod ?? false
  const firstCollectedAt = view?.firstCashCollectedAt ?? driver?.firstCashCollectedAt ?? null
  const currency = view?.currency ?? 'LYD'

  const loadView = useCallback(async () => {
    if (!driver?.id) return
    setLoading(true)
    setLoadError('')
    try {
      const mapped = await loadDriverCustodyView(driver.id)
      setView(mapped)
      onCustodyLoaded?.(mapped)
    } catch (err) {
      if (err?.status === 403) {
        const fallback = {
          custodyBalance: driver.custodyBalance ?? 0,
          pendingCash: driver.pendingCash ?? 0,
          currency: 'LYD',
          firstCashCollectedAt: driver.firstCashCollectedAt ?? null,
          isBlockedFromCod: driver.isBlockedFromCod ?? false,
          source: 'driver-profile',
        }
        setView(fallback)
        onCustodyLoaded?.(fallback)
        setLoadError('')
        return
      }
      setView(null)
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل عهدة السائق.'))
    } finally {
      setLoading(false)
    }
  }, [driver, onCustodyLoaded])

  useEffect(() => {
    loadView()
  }, [loadView])

  return (
    <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white/80">عرض العهدة — السائق والإدارة العليا</h3>
        {loading ? <Loader2 className="size-4 animate-spin text-white/50" /> : null}
      </div>

      {loadError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 sm:col-span-2">
          <p className="text-xs text-white/60">رصيد العهدة النقدية</p>
          <p className="mt-1 text-2xl font-bold text-amber-300 tabular-nums" dir="ltr">
            {formatDriverCustodyAmount(custodyBalance, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
          <p className="text-xs text-white/60">النقد المعلق</p>
          <p className="mt-1 text-lg font-bold text-white tabular-nums" dir="ltr">
            {formatDriverCustodyAmount(pendingCash, currency)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
          <p className="text-xs text-white/60">أول تحصيل نقدي</p>
          <p className="mt-1 text-sm font-bold text-white">
            {formatCustodyDate(firstCollectedAt)}
          </p>
        </div>
      </div>

      {isBlocked ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>السائق محظور من استلام الدفع عند التسليم (COD) بسبب تأخر تسوية العهدة.</p>
        </div>
      ) : null}

      {!loading && !loadError && custodyBalance <= 0 ? (
        <p className="text-xs text-white/50">لا يوجد رصيد عهدة مسجّل حالياً لهذا السائق.</p>
      ) : null}
    </div>
  )
}
