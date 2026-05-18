import { useEffect, useId, useState } from 'react'
import { Plus, X } from 'lucide-react'

const DURATION_OPTIONS = [
  { value: 'monthly', label: 'شهري' },
  { value: 'yearly', label: 'سنوي' },
]

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'paused', label: 'موقوف' },
]

function emptyForm() {
  return {
    name: '',
    price: '0',
    duration: 'monthly',
    status: 'active',
  }
}

export function PlanFormModal({ open, mode, initialPlan, onClose, onSave }) {
  const titleId = useId()
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialPlan) {
      setForm({
        name: initialPlan.name,
        price: String(initialPlan.price),
        duration: initialPlan.duration ?? 'monthly',
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

  if (!open) return null

  const isEdit = mode === 'edit'

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    const priceNum = Number(form.price)
    if (!name || Number.isNaN(priceNum) || priceNum < 0) return

    onSave?.({
      mode,
      id: initialPlan?.id,
      name,
      price: priceNum,
      duration: form.duration,
      status: form.status,
    })
    onClose?.()
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
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80 animate-in zoom-in-95 duration-200"
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-5">
          <h2 id={titleId} className="text-xl font-bold text-slate-900">
            {isEdit ? 'تعديل بيانات الخطة' : 'إنشاء خطة اشتراك جديدة'}
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-200/50 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.5} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div className="group">
              <label htmlFor="plan-name" className="mb-2 block text-sm font-bold text-slate-700">
                اسم الخطة <span className="text-rose-500">*</span>
              </label>
              <input
                id="plan-name"
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="مثال: الخطة السنوية المتقدمة"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-brand-700 focus:bg-white focus:ring-4 focus:ring-brand-900/10"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="plan-price" className="mb-2 block text-sm font-bold text-slate-700">
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
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-brand-700 focus:bg-white focus:ring-4 focus:ring-brand-900/10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="plan-duration" className="mb-2 block text-sm font-bold text-slate-700">
                  دورة الفوترة
                </label>
                <select
                  id="plan-duration"
                  value={form.duration}
                  onChange={(e) => setField('duration', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-brand-700 focus:bg-white focus:ring-4 focus:ring-brand-900/10"
                >
                  {DURATION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="plan-status" className="mb-2 block text-sm font-bold text-slate-700">
                حالة الخطة
              </label>
              <select
                id="plan-status"
                value={form.status}
                onChange={(e) => setField('status', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:border-brand-700 focus:bg-white focus:ring-4 focus:ring-brand-900/10"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <footer className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onClose?.()}
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
            >
              إلغاء الإجراء
            </button>
            <button
              type="submit"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-brand-900 px-8 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-950 hover:shadow-lg focus:ring-4 focus:ring-brand-900/20 active:scale-95"
            >
              {isEdit ? 'تأكيد الحفظ' : 'إنشاء الخطة'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
