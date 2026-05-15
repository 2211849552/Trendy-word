import { useEffect, useId, useState } from 'react'
import { Plus, X } from 'lucide-react'

const DURATION_OPTIONS = [{ value: 'monthly', label: 'شهري' }]
const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط' },
  { value: 'paused', label: 'موقوف' },
]

function newFeatureRow() {
  return { id: crypto.randomUUID(), text: '' }
}

function emptyForm() {
  return {
    name: '',
    price: '0',
    duration: 'monthly',
    status: 'active',
    features: [newFeatureRow()],
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
        features:
          initialPlan.features?.length > 0
            ? initialPlan.features.map((text) => ({
                id: crypto.randomUUID(),
                text,
              }))
            : [newFeatureRow()],
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

  function addFeatureRow() {
    setForm((f) => ({ ...f, features: [...f.features, newFeatureRow()] }))
  }

  function updateFeature(id, text) {
    setForm((f) => ({
      ...f,
      features: f.features.map((row) => (row.id === id ? { ...row, text } : row)),
    }))
  }

  function removeFeature(id) {
    setForm((f) => ({
      ...f,
      features: f.features.length <= 1 ? f.features : f.features.filter((row) => row.id !== id),
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const name = form.name.trim()
    const priceNum = Number(form.price)
    const featureTexts = form.features.map((r) => r.text.trim()).filter(Boolean)
    if (!name || Number.isNaN(priceNum) || priceNum < 0 || featureTexts.length === 0) return

    onSave?.({
      mode,
      id: initialPlan?.id,
      name,
      price: priceNum,
      duration: form.duration,
      status: form.status,
      features: featureTexts,
    })
    onClose?.()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[min(90dvh,720px)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/80"
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <h2 id={titleId} className="text-lg font-bold text-slate-900">
            {isEdit ? 'تعديل الخطة' : 'إضافة خطة اشتراك'}
          </h2>
          <button
            type="button"
            onClick={() => onClose?.()}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
          <div>
            <label htmlFor="plan-name" className="mb-1.5 block text-sm font-medium text-slate-700">
              اسم الخطة <span className="text-sky-600">*</span>
            </label>
            <input
              id="plan-name"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="مثال: الخطة الذهبية"
              required
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="plan-price" className="mb-1.5 block text-sm font-medium text-slate-700">
                السعر (د.ل) <span className="text-sky-600">*</span>
              </label>
              <input
                id="plan-price"
                type="number"
                min={0}
                step={1}
                value={form.price}
                onChange={(e) => setField('price', e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label htmlFor="plan-duration" className="mb-1.5 block text-sm font-medium text-slate-700">
                المدة
              </label>
              <select
                id="plan-duration"
                value={form.duration}
                onChange={(e) => setField('duration', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
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
            <label htmlFor="plan-status" className="mb-1.5 block text-sm font-medium text-slate-700">
              الحالة
            </label>
            <select
              id="plan-status"
              value={form.status}
              onChange={(e) => setField('status', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-slate-700">
                المميزات <span className="text-sky-600">*</span>
              </span>
              <button
                type="button"
                onClick={addFeatureRow}
                className="inline-flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-700"
              >
                <Plus className="size-4" strokeWidth={2.25} aria-hidden />
                إضافة ميزة
              </button>
            </div>
            <ul className="space-y-2">
              {form.features.map((row) => (
                <li key={row.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.text}
                    onChange={(e) => updateFeature(row.id, e.target.value)}
                    placeholder="مثال: حتى 100 منتج"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                  {isEdit ? (
                    <button
                      type="button"
                      onClick={() => removeFeature(row.id)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      aria-label="حذف الميزة"
                    >
                      <X className="size-5" strokeWidth={2} />
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <footer className="flex flex-wrap items-center justify-start gap-2 border-t border-slate-100 pt-5">
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700"
            >
              {isEdit ? 'حفظ التعديلات' : 'إضافة الخطة'}
            </button>
            <button
              type="button"
              onClick={() => onClose?.()}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50"
            >
              إلغاء
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}
