import { useState } from 'react'
import { Wallet } from 'lucide-react'
import {
  settleDriverCustody,
  mapSettleDriverCashResponse,
  formatDriverCustodyAmount,
} from '../../api/driverCustody.js'
import { DriverSettleCustodyModal } from './DriverSettleCustodyModal.jsx'

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية تسوية عهدة السائق.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  const msg = err?.message || fallback
  if (msg.includes('cash collected balance')) {
    return 'تعذّر التسوية: المبلغ يتجاوز رصيد العهدة النقدية المحصّلة في النظام.'
  }
  return msg
}

export function DriverCustodySection({
  driver,
  custodyView,
  onDriverUpdated,
  onMessage,
  onError,
  onSettled,
}) {
  const [settleOpen, setSettleOpen] = useState(false)
  const [settling, setSettling] = useState(false)

  const settleable = custodyView?.custodyBalance ?? driver?.custodyBalance ?? 0

  async function handleSettle({ amount, description }) {
    if (!driver?.id) return
    setSettling(true)
    try {
      const result = await settleDriverCustody(driver.id, { amount, description })
      const settled = mapSettleDriverCashResponse(result)
      setSettleOpen(false)
      onDriverUpdated?.({
        custodyBalance: settled.cashCollectedBalance,
        pendingCash: settled.pendingCash,
      })
      onSettled?.({
        custodyBalance: settled.cashCollectedBalance,
        pendingCash: settled.pendingCash,
        isBlockedFromCod: driver?.isBlockedFromCod ?? false,
        firstCashCollectedAt: driver?.firstCashCollectedAt ?? null,
        currency: 'LYD',
        source: 'custody-balance',
      })
      onMessage?.(
        settled.message ||
          `تمت تسوية العهدة مع السائق بنجاح (${formatDriverCustodyAmount(amount)}).`,
      )
    } catch (err) {
      onError?.(apiErrorMessage(err, 'تعذّر تسوية عهدة السائق.'))
    } finally {
      setSettling(false)
    }
  }

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-brand-300/50 p-5 space-y-4">
        <h3 className="text-sm font-bold text-white/80">تسوية العهدة — تأكيد استلام السائق</h3>
        <p className="text-xs text-white/50">
          تأكيد أن السائق استلم مبلغه من الإدارة العليا بعد تسليم العهدة النقدية المحصّلة.
        </p>
        <button
          type="button"
          disabled={settling || settleable <= 0}
          onClick={() => setSettleOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wallet className="size-4" />
          تسوية العهدة ({formatDriverCustodyAmount(settleable)})
        </button>
        {settleable <= 0 ? (
          <p className="text-xs text-white/50">لا يوجد رصيد عهدة للتسوية حالياً.</p>
        ) : null}
      </div>

      <DriverSettleCustodyModal
        open={settleOpen}
        driver={{ ...driver, custodyBalance: settleable }}
        onClose={() => {
          if (!settling) setSettleOpen(false)
        }}
        onSubmit={handleSettle}
        saving={settling}
      />
    </>
  )
}
