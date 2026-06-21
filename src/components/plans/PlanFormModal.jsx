import { useEffect, useId, useState } from 'react'
import { Plus, Pencil, X } from 'lucide-react'
import { PrimaryButton } from '../PrimaryButton.jsx'
import { PlanSubscribedStoresSection } from './PlanSubscribedStoresSection.jsx'
import {
  findPlanSubscriptions,
  getAdminPlanSubscriptions,
  mapPlanSubscriptionStore,
} from '../../api/adminPlans.js'

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'paused', label: 'موقوف' },
]

function emptyForm() {
  return {
    name: '',
    price: '0',
    durationDays: '30',
    status: 'active',
  }
}

export function PlanFormModal({
  open,
  mode,
  initialPlan,
  onClose,
  onSave,
  onEdit,
  saving = false,
  loadSubscriptions = true,
  canManage = false,
}) {
  const titleId = useId()
  const [form, setForm] = useState(emptyForm)
  const [subscribedStores, setSubscribedStores] = useState([])
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(false)
  const [subscriptionsError, setSubscriptionsError] = useState('')

  useEffect(() => {
    if (!open) return
    if ((mode === 'edit' || mode === 'view') && initialPlan) {
      setForm({
        name: initialPlan.name,
        price: String(initialPlan.price),
        durationDays: String(initialPlan.durationDays ?? 30),
        status: initialPlan.status ?? 'active',
      })
    } else {
      setForm(emptyForm())
    }
  }, [open, mode, initialPlan])

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
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  useEffect(() => {
    if (!open || mode !== 'view' || !initialPlan?.id || !loadSubscriptions) {
      setSubscribedStores([])
      setSubscriptionsLoading(false)
      setSubscriptionsError('')
      return
    }

    let cancelled = false
    setSubscriptionsLoading(true)
    setSubscriptionsError('')
    setSubscribedStores([])

    getAdminPlanSubscriptions()
      .then((data) => {
        if (cancelled) return
        const stores = findPlanSubscriptions(data, initialPlan.id).map(mapPlanSubscriptionStore)
        setSubscribedStores(stores)
      })
      .catch((err) => {
        if (cancelled) return
        setSubscribedStores([])
        setSubscriptionsError(err?.message || 'تعذّر تحميل المتاجر المشتركة.')
      })
      .finally(() => {
        if (!cancelled) setSubscriptionsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, mode, initialPlan?.id, loadSubscriptions])

  if (!open) return null

  const isEdit = mode === 'edit'
  const isView = mode === 'view'
  const readOnly = isView

  function setField(key, value) {
    if (readOnly) return
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (isView || saving) return
    const name = form.name.trim()
    const priceNum = Number(form.price)
    const durationDays = Number(form.durationDays)
    if (!name || Number.isNaN(priceNum) || priceNum < 0) return
    if (!Number.isInteger(durationDays) || durationDays < 1) return

    await onSave?.({
      mode,
      id: initialPlan?.id,
      name,
      price: priceNum,
      durationDays,
      status: form.status,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px] animate-in fade-in duration-200"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex w-full flex-col overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80 animate-in zoom-in-95 duration-200 ${
          isView ? 'max-h-[85vh] max-w-md' : 'max-w-lg'
        }`}
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-brand-300/50 px-5 py-4">
          <h2 id={titleId} className={`font-bold text-white ${isView ? 'text-lg' : 'text-xl'}`}>
            {isView ? 'تفاصيل خطة الاشتراك' : isEdit ? 'تعديل بيانات الخطة' : 'إنشاء خطة اشتراك جديدة'}
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-xl p-2 text-white/50 transition-colors hover:bg-slate-200/50 hover:text-white/80"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className={`space-y-5 ${isView ? 'flex-1 overflow-y-auto px-5 py-4' : 'p-6'}`}>
            <div className="group">
              <label htmlFor="plan-name" className="mb-2 block text-sm font-bold text-white/80">
                اسم الخطة <span className="text-rose-500">*</span>
              </label>
              <input
                id="plan-name"
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="مثال: الخطة السنوية المتقدمة"
                required={!readOnly}
                readOnly={readOnly}
                className="w-full rounded-xl border border-white/10 bg-brand-300/50 px-4 py-3 text-sm font-medium text-white outline-none transition-all focus:border-brand-700 focus:bg-brand-200 focus:ring-4 focus:ring-brand-900/10 read-only:opacity-90"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="plan-price" className="mb-2 block text-sm font-bold text-white/80">
                  السعر (د.ل) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="plan-price"
                    type="number"
                    min={0}
                    step={1}
                    value={form.price}
                    onChange={(e) => setField('price', e.target.value)}
                    required={!readOnly}
                    readOnly={readOnly}
                    className="w-full rounded-xl border border-white/10 bg-brand-300/50 px-4 py-3 text-sm font-bold text-white outline-none transition-all focus:border-brand-700 focus:bg-brand-200 focus:ring-4 focus:ring-brand-900/10 read-only:opacity-90"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="plan-duration-days" className="mb-2 block text-sm font-bold text-white/80">
                  مدة الاشتراك (يوم) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="plan-duration-days"
                  type="number"
                  min={1}
                  step={1}
                  value={form.durationDays}
                  onChange={(e) => setField('durationDays', e.target.value)}
                  required={!readOnly}
                  readOnly={readOnly}
                  placeholder="مثال: 30"
                  className="w-full rounded-xl border border-white/10 bg-brand-300/50 px-4 py-3 text-sm font-bold text-white outline-none transition-all focus:border-brand-700 focus:bg-brand-200 focus:ring-4 focus:ring-brand-900/10 read-only:opacity-90"
                />
              </div>
            </div>

            <div>
              <label htmlFor="plan-status" className="mb-2 block text-sm font-bold text-white/80">
                حالة الخطة
              </label>
              <select
                id="plan-status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                disabled={readOnly}
                className="w-full rounded-xl border border-white/10 bg-brand-300/50 px-4 py-3 text-sm font-bold text-white outline-none transition-all focus:border-brand-700 focus:bg-brand-200 focus:ring-4 focus:ring-brand-900/10 disabled:opacity-90"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            {isView && loadSubscriptions ? (
              <PlanSubscribedStoresSection
                stores={subscribedStores}
                loading={subscriptionsLoading}
                error={subscriptionsError}
              />
            ) : null}
          </div>

          <footer
            className={`flex shrink-0 flex-col-reverse gap-2 border-t border-white/5 bg-brand-200 ${
              isView ? 'px-5 py-3 sm:flex-row sm:justify-end' : 'mt-8 px-6 pb-6 pt-6 sm:flex-row sm:justify-end'
            }`}
          >
            <button
              type="button"
              onClick={() => onClose?.()}
              className={`inline-flex items-center justify-center rounded-xl border border-white/10 bg-brand-200 text-sm font-bold text-white/80 shadow-premium transition-all hover:bg-brand-300 hover:border-white/20 ${
                isView ? 'min-h-10 px-6' : 'min-h-[48px] px-8'
              }`}
            >
              {isView ? 'إغلاق' : 'إلغاء الإجراء'}
            </button>
            {isView && canManage ? (
              <button
                type="button"
                onClick={() => onEdit?.(initialPlan)}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white btn-primary"
              >
                <Pencil className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                تعديل
              </button>
            ) : null}
            {!isView ? (
            <PrimaryButton
              type="submit"
              disabled={saving}
              size="lg"
            >
              {saving ? 'جاري الحفظ...' : isEdit ? 'تأكيد الحفظ' : 'إنشاء الخطة'}
            </PrimaryButton>
            ) : null}
          </footer>
        </form>
      </div>
    </div>
  )
}
