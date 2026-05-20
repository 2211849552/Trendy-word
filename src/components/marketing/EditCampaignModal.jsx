import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function EditCampaignModal({ campaign, open, onClose, onSave }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [storeName, setStoreName] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!open || !campaign) return
    setName(campaign.title)
    setDescription(campaign.description)
    setStoreName(campaign.storeName)
    setDateFrom(campaign.dateFrom)
    setDateTo(campaign.dateTo)
    setErrors({})
  }, [open, campaign])

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

  if (!open || !campaign) return null

  const fieldClass =
    'w-full rounded-xl border border-white/10 bg-brand-300/80 px-3 py-2.5 text-sm text-white outline-none transition focus:border-brand-900 focus:bg-brand-200 focus:ring-2 focus:ring-brand-900/20'

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'مطلوب'
    if (!description.trim()) e.description = 'مطلوب'
    if (!storeName.trim()) e.storeName = 'مطلوب'
    if (!dateFrom) e.dateFrom = 'مطلوب'
    if (!dateTo) e.dateTo = 'مطلوب'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    onSave?.({
      id: campaign.id,
      title: name.trim(),
      description: description.trim(),
      storeName: storeName.trim(),
      dateFrom,
      dateTo,
    })
    onClose?.()
  }

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
        aria-labelledby="edit-campaign-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-brand-200 px-5 py-4">
          <h2 id="edit-campaign-title" className="text-lg font-bold text-white">
            تعديل الحملة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-brand-300 hover:text-white/90"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-6">
          <div>
            <label htmlFor="edit-name" className="mb-1.5 block text-sm font-semibold text-white/90">
              اسم الحملة
            </label>
            <input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (errors.name) setErrors((x) => ({ ...x, name: '' }))
              }}
              className={fieldClass}
            />
            {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name}</p> : null}
          </div>

          <div>
            <label htmlFor="edit-desc" className="mb-1.5 block text-sm font-semibold text-white/90">
              الوصف
            </label>
            <textarea
              id="edit-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (errors.description) setErrors((x) => ({ ...x, description: '' }))
              }}
              rows={4}
              className={`${fieldClass} resize-y min-h-[100px]`}
            />
            {errors.description ? (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="edit-store" className="mb-1.5 block text-sm font-semibold text-white/90">
              اسم المتجر
            </label>
            <input
              id="edit-store"
              value={storeName}
              onChange={(e) => {
                setStoreName(e.target.value)
                if (errors.storeName) setErrors((x) => ({ ...x, storeName: '' }))
              }}
              className={fieldClass}
            />
            {errors.storeName ? (
              <p className="mt-1 text-xs text-rose-600">{errors.storeName}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="edit-from" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ البدء
              </label>
              <input
                id="edit-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  if (errors.dateFrom) setErrors((x) => ({ ...x, dateFrom: '' }))
                }}
                className={fieldClass}
              />
              {errors.dateFrom ? (
                <p className="mt-1 text-xs text-rose-600">{errors.dateFrom}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="edit-to" className="mb-1.5 block text-sm font-semibold text-white/90">
                تاريخ الانتهاء
              </label>
              <input
                id="edit-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  if (errors.dateTo) setErrors((x) => ({ ...x, dateTo: '' }))
                }}
                className={fieldClass}
              />
              {errors.dateTo ? <p className="mt-1 text-xs text-rose-600">{errors.dateTo}</p> : null}
            </div>
          </div>

          <div className="flex gap-3 border-t border-white/5 pt-5" dir="rtl">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-brand-200 px-5 py-2.5 text-sm font-semibold text-white/80 shadow-premium hover:bg-brand-300"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow-premium hover:bg-brand-950"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
