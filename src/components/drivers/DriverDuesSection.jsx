import { useCallback, useEffect, useState } from 'react'
import { DollarSign, Loader2 } from 'lucide-react'
import { getDriverDueBalance, settleDriverDues } from '../../api/adminDrivers.js'
import { formatDriverCustodyAmount } from '../../api/driverCustody.js'
import { DriverSettleDuesModal } from './DriverSettleDuesModal.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية عرض/تسوية مستحقات السائق.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function DriverDuesSection({ driver, onMessage, onError }) {
  const [dueBalance, setDueBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [settleOpen, setSettleOpen] = useState(false)
  const [settling, setSettling] = useState(false)

  useEffect(() => {
    let active = true
    async function loadDueBalance() {
      if (!driver?.id) return
      setLoading(true)
      setLoadError('')
      try {
        const balance = await getDriverDueBalance(driver.id)
        if (!active) return
        setDueBalance(balance)
      } catch (err) {
        if (!active) return
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل مستحقات السائق.'))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDueBalance()

    return () => {
      active = false
    }
  }, [driver?.id])

  async function handleSettle({ amount, description }) {
    if (!driver?.id) return
    setSettling(true)
    try {
      const result = await settleDriverDues(driver.id, { amount, description })
      setSettleOpen(false)
      
      // Reload balance after settlement
      const newBalance = await getDriverDueBalance(driver.id)
      setDueBalance(newBalance)

      onMessage?.(
        result?.message ||
          `تمت تسوية المستحقات مع السائق بنجاح (${formatDriverCustodyAmount(amount)}).`,
      )
    } catch (err) {
      onError?.(apiErrorMessage(err, 'تعذّر تسوية مستحقات السائق.'))
    } finally {
      setSettling(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-white/80">مستحقات السائق</h3>
          {loading ? <Loader2 className="size-4 animate-spin text-white/50" /> : null}
        </div>

        {loadError ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3">
            <p className="text-xs text-white/60">رصيد المستحقات المستحقة</p>
            <p className="mt-1 text-2xl font-bold text-emerald-300 tabular-nums" dir="ltr">
              {formatDriverCustodyAmount(dueBalance)}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={settling || loading || dueBalance <= 0}
          onClick={() => setSettleOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DollarSign className="size-4" />
          تسوية المستحقات ({formatDriverCustodyAmount(dueBalance)})
        </button>

        {dueBalance <= 0 && !loading ? (
          <p className="text-xs text-white/50">لا يوجد مستحقات للتسوية حالياً لهذا السائق.</p>
        ) : null}
      </div>

      <DriverSettleDuesModal
        open={settleOpen}
        driver={driver}
        dueBalance={dueBalance}
        onClose={() => {
          if (!settling) setSettleOpen(false)
        }}
        onSubmit={handleSettle}
        saving={settling}
      />
    </>
  )
}
