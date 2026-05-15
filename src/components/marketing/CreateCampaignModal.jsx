import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const initial = {
  name: '',
  description: '',
  storeName: '',
  link: '',
  dateFrom: '',
  dateTo: '',
}

export function CreateCampaignModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open) {
      setForm(initial)
      setErrors({})
    }
  }, [open])

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
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }))
    if (errors[k]) setErrors((e) => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'مطلوب'
    if (!form.description.trim()) e.description = 'مطلوب'
    if (!form.storeName.trim()) e.storeName = 'مطلوب'
    if (!form.dateFrom) e.dateFrom = 'مطلوب'
    if (!form.dateTo) e.dateTo = 'مطلوب'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    onSubmit?.({ ...form })
    onClose?.()
  }

  const fieldClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-500/20'

  const overlay = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-campaign-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="create-campaign-title" className="text-lg font-bold text-slate-900">
            إنشاء حملة إعلانية
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6">
          <div>
            <label htmlFor="camp-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              اسم الحملة <span className="text-rose-600">*</span>
            </label>
            <input
              id="camp-name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="مثال: حملة تخفيضات الصيف"
              className={fieldClass}
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="camp-desc" className="mb-1.5 block text-sm font-semibold text-slate-800">
              الوصف <span className="text-rose-600">*</span>
            </label>
            <textarea
              id="camp-desc"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="وصف الحملة"
              rows={4}
              className={`${fieldClass} resize-y min-h-[100px]`}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="camp-store" className="mb-1.5 block text-sm font-semibold text-slate-800">
              اسم المتجر <span className="text-rose-600">*</span>
            </label>
            <input
              id="camp-store"
              value={form.storeName}
              onChange={(e) => set('storeName', e.target.value)}
              placeholder="مثال: أزياء الوفاء، LC وايكيكي، مانجو…"
              className={fieldClass}
            />
            {errors.storeName ? (
              <p className="mt-1 text-xs text-rose-600">{errors.storeName}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="camp-link" className="mb-1.5 block text-sm font-semibold text-slate-800">
              رابط الحملة
            </label>
            <input
              id="camp-link"
              value={form.link}
              onChange={(e) => set('link', e.target.value)}
              placeholder="/offers/summer/"
              className={fieldClass}
              dir="ltr"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="camp-from" className="mb-1.5 block text-sm font-semibold text-slate-800">
                تاريخ البدء <span className="text-rose-600">*</span>
              </label>
              <input
                id="camp-from"
                type="date"
                value={form.dateFrom}
                onChange={(e) => set('dateFrom', e.target.value)}
                className={fieldClass}
              />
              {errors.dateFrom ? (
                <p className="mt-1 text-xs text-rose-600">{errors.dateFrom}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="camp-to" className="mb-1.5 block text-sm font-semibold text-slate-800">
                تاريخ الانتهاء <span className="text-rose-600">*</span>
              </label>
              <input
                id="camp-to"
                type="date"
                value={form.dateTo}
                onChange={(e) => set('dateTo', e.target.value)}
                className={fieldClass}
              />
              {errors.dateTo ? <p className="mt-1 text-xs text-rose-600">{errors.dateTo}</p> : null}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-700"
            >
              إضافة الحملة
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
