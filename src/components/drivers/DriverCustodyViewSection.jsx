import { useCallback, useEffect, useRef, useState } from 'react'
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
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

export function DriverCustodyViewSection({ driver, onCustodyLoaded }) {
  const [view, setView] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const onCustodyLoadedRef = useRef(onCustodyLoaded)
  const driverRef = useRef(driver)
  const driverId = driver?.id

  onCustodyLoadedRef.current = onCustodyLoaded
  driverRef.current = driver

  const display = driver?.custodyView ?? view
  const custodyBalance = display?.custodyBalance ?? driver?.custodyBalance ?? 0
  const isBlocked = display?.isBlockedFromCod ?? driver?.isBlockedFromCod ?? false
  const currency = display?.currency ?? 'LYD'

  const loadView = useCallback(async () => {
    if (!driverId) return
    setLoading(true)
    setLoadError('')
    try {
      const mapped = await loadDriverCustodyView(driverId)
      setView(mapped)
      onCustodyLoadedRef.current?.(mapped)
    } catch (err) {
      if (err?.status === 403) {
        const current = driverRef.current
        const fallback = {
          custodyBalance: current?.custodyBalance ?? 0,
          currency: 'LYD',
          isBlockedFromCod: current?.isBlockedFromCod ?? false,
          source: 'driver-profile',
        }
        setView(fallback)
        onCustodyLoadedRef.current?.(fallback)
        setLoadError('')
        return
      }
      setView(null)
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل عهدة السائق.'))
    } finally {
      setLoading(false)
    }
  }, [driverId])

  useEffect(() => {
    setView(null)
    let active = true

    async function run() {
      if (!driverId) return
      setLoading(true)
      setLoadError('')
      try {
        const mapped = await loadDriverCustodyView(driverId)
        if (!active) return
        setView(mapped)
        onCustodyLoadedRef.current?.(mapped)
      } catch (err) {
        if (!active) return
        if (err?.status === 403) {
          const current = driverRef.current
          const fallback = {
            custodyBalance: current?.custodyBalance ?? 0,
            currency: 'LYD',
            isBlockedFromCod: current?.isBlockedFromCod ?? false,
            source: 'driver-profile',
          }
          setView(fallback)
          onCustodyLoadedRef.current?.(fallback)
          setLoadError('')
          return
        }
        setView(null)
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل عهدة السائق.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    run()

    return () => {
      active = false
    }
  }, [driverId])

  return (
    <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-white/80">عرض العهدة — السائق والإدارة العليا</h3>
        <div className="flex items-center gap-2">
          {loading ? <Loader2 className="size-4 animate-spin text-white/50" /> : null}
          <button
            type="button"
            onClick={loadView}
            disabled={loading || !driverId}
            className="rounded-lg p-1.5 text-white/50 hover:bg-brand-300 hover:text-white/80 disabled:opacity-40"
            title="تحديث رصيد العهدة"
            aria-label="تحديث رصيد العهدة"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <p className="text-xs text-white/50">
        رصيد النقد المحصّل (COD) من الطلبات التي قام السائق بتوصيلها وتأكيد تسليمها ولم تُسوَّ بعد مع الإدارة.
      </p>

      {loadError ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {loadError}
        </p>
      ) : null}

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3">
        <p className="text-xs text-white/60">رصيد العهدة النقدية</p>
        <p className="mt-1 text-2xl font-bold text-amber-300 tabular-nums" dir="ltr">
          {loading && !display ? '...' : formatDriverCustodyAmount(custodyBalance, currency)}
        </p>
      </div>

      {isBlocked ? (
        <div className="flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>السائق محظور من استلام الدفع عند التسليم (COD) بسبب تأخر تسوية العهدة.</p>
        </div>
      ) : null}

      {!loading && !loadError && custodyBalance <= 0 ? (
        <p className="text-xs text-white/50">
          لا يوجد رصيد عهدة حالياً. تُسجَّل العهدة فقط للطلبات النقدية (COD) بعد تأكيد التسليم من السائق أو الإدارة.
        </p>
      ) : null}
    </div>
  )
}
