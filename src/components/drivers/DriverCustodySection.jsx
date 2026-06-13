import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Wallet } from 'lucide-react'
import {
  getDriverCustodyBalance,
  settleDriverCash,
  mapDriverCustodyBalance,
  mapSettleDriverCashResponse,
  formatDriverCustodyAmount,
} from '../../api/adminDrivers.js'
import { DriverSettleCustodyModal } from './DriverSettleCustodyModal.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض أو تسوية عهدة السائق.'
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

export function DriverCustodySection({ driver, onDriverUpdated, onMessage, onError }) {
  const [custody, setCustody] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [settleOpen, setSettleOpen] = useState(false)
  const [settling, setSettling] = useState(false)

  const balance = custody?.balance ?? driver?.custodyBalance ?? 0
  const pendingCash = driver?.pendingCash ?? 0
  const isBlocked = custody?.isBlockedFromCod ?? driver?.isBlockedFromCod ?? false
  const firstCollectedAt = custody?.firstCollectedAt ?? driver?.firstCashCollectedAt ?? null

  const loadCustody = useCallback(async () => {
    if (!driver?.id) return
    setLoading(true)
    setLoadError('')
    try {
      const data = await getDriverCustodyBalance(driver.id)
      setCustody(mapDriverCustodyBalance(data))
    } catch (err) {
      if (err?.status === 403) {
        setCustody({
          balance: driver.custodyBalance ?? 0,
          currency: 'LYD',
          firstCollectedAt: driver.firstCashCollectedAt ?? null,
          isBlockedFromCod: driver.isBlockedFromCod ?? false,
        })
        setLoadError('')
        return
      }
      setCustody(null)
      setLoadError(apiErrorMessage(err, 'تعذّر تحميل رصيد العهدة.'))
    } finally {
      setLoading(false)
    }
  }, [driver])

  useEffect(() => {
    loadCustody()
  }, [loadCustody])

  async function handleSettle({ amount, description }) {
    if (!driver?.id) return
    setSettling(true)
    try {
      const result = await settleDriverCash(driver.id, { amount, description })
      const settled = mapSettleDriverCashResponse(result)
      setSettleOpen(false)
      setCustody((prev) => ({
        balance: settled.cashCollectedBalance,
        currency: prev?.currency ?? 'LYD',
        firstCollectedAt: prev?.firstCollectedAt ?? null,
        isBlockedFromCod: prev?.isBlockedFromCod ?? false,
      }))
      onDriverUpdated?.({
        custodyBalance: settled.cashCollectedBalance,
        pendingCash: settled.pendingCash,
        totalEarnings: settled.earningsBalance,
      })
      onMessage?.(
        settled.message ||
          `تم تسوية العهدة بنجاح (${formatDriverCustodyAmount(amount)}).`,
      )
      await loadCustody()
    } catch (err) {
      onError?.(apiErrorMessage(err, 'تعذّر تسوية العهدة.'))
    } finally {
      setSettling(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white/80">العهدة النقدية</h3>
          {loading ? <Loader2 className="size-4 animate-spin text-white/50" /> : null}
        </div>

        {loadError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
            <p className="text-xs text-white/60">رصيد العهدة المستحق</p>
            <p className="mt-1 text-lg font-bold text-amber-300 tabular-nums" dir="ltr">
              {formatDriverCustodyAmount(balance)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-brand-300 p-3">
            <p className="text-xs text-white/60">النقد المعلق (قديم)</p>
            <p className="mt-1 text-lg font-bold text-white tabular-nums" dir="ltr">
              {formatDriverCustodyAmount(pendingCash)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-brand-300 p-3 sm:col-span-2">
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

        <button
          type="button"
          disabled={loading || settling || balance <= 0}
          onClick={() => setSettleOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wallet className="size-4" />
          تسوية العهدة النقدية
        </button>
        {!loading && balance <= 0 ? (
          <p className="text-xs text-white/50">لا توجد عهدة مستحقة للتسوية حالياً.</p>
        ) : null}
      </div>

      <DriverSettleCustodyModal
        open={settleOpen}
        driver={{ ...driver, custodyBalance: balance }}
        onClose={() => {
          if (!settling) setSettleOpen(false)
        }}
        onSubmit={handleSettle}
        saving={settling}
      />
    </>
  )
}
