import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Wallet, X } from 'lucide-react'
import { formatDriverCustodyAmount } from '../../api/driverCustody.js'

export function DriverSettleCustodyModal({
  open,
  driver,
  onClose,
  onSubmit,
  saving = false,
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const balance = Number(driver?.custodyBalance ?? 0)

  useEffect(() => {
    if (!open) return
    setAmount(balance > 0 ? String(balance) : '')
    setDescription('')
    setError('')
  }, [open, balance])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !saving) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, saving])

  if (!open || !driver) return null

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-brand-300/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-900 focus:bg-brand-200 focus:ring-2 focus:ring-brand-900/20'

  const validate = () => {
    const num = Number(amount)
    if (!amount || Number.isNaN(num)) return 'أدخلي مبلغ التسوية.'
    if (num < 0.01) return 'الحد الأدنى للتسوية 0.01 د.ل.'
    if (num > balance) return `المبلغ يتجاوز رصيد العهدة (${formatDriverCustodyAmount(balance)}).`
    return ''
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    await onSubmit?.({
      amount: Number(amount),
      description: description.trim() || undefined,
    })
  }

  const overlay = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        disabled={saving}
        onClick={() => !saving && onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="driver-settle-custody-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
          <h2 id="driver-settle-custody-title" className="text-lg font-bold text-white">
            تأكيد تسوية العهدة مع السائق
          </h2>
          <button
            type="button"
            onClick={() => !saving && onClose?.()}
            disabled={saving}
            className="rounded-lg p-2 text-white/60 hover:bg-brand-300 hover:text-white/90 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center">
            <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-300">
              <Wallet className="size-5" />
            </div>
            <p className="text-xs text-white/60">رصيد العهدة القابل للتسوية — {driver.name}</p>
            <p className="mt-1 text-xl font-bold text-amber-300 tabular-nums" dir="ltr">
              {formatDriverCustodyAmount(balance)}
            </p>
          </div>

          <div>
            <label htmlFor="settle-amount" className="mb-1.5 block text-sm font-semibold text-white/90">
              مبلغ التسوية (د.ل) <span className="text-rose-600">*</span>
            </label>
            <input
              id="settle-amount"
              type="number"
              min={0.01}
              max={balance}
              step={0.01}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                if (error) setError('')
              }}
              className={fieldClass}
              dir="ltr"
              disabled={saving}
            />
            {balance > 0 ? (
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                disabled={saving}
                className="mt-1.5 text-xs font-bold text-brand-300 hover:text-brand-200 disabled:opacity-50"
              >
                تسوية كامل الرصيد
              </button>
            ) : null}
          </div>

          <div>
            <label htmlFor="settle-description" className="mb-1.5 block text-sm font-semibold text-white/90">
              ملاحظة (اختياري)
            </label>
            <textarea
              id="settle-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="مثال: تسليم نقدي في المكتب"
              className={`${fieldClass} resize-y min-h-[80px]`}
              disabled={saving}
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-2 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              disabled={saving}
              className="rounded-xl border border-white/10 bg-brand-200 px-5 py-2.5 text-sm font-semibold text-white/80 shadow-premium hover:bg-brand-300 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || balance <= 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:bg-brand-950 disabled:opacity-60"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : null}
              {saving ? 'جاري التأكيد...' : 'تأكيد استلام السائق للمبلغ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
