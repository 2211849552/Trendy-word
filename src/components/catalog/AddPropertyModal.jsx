import { useMemo, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { PROPERTY_TYPE_LABELS } from '../../data/catalog.js'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-900 focus:bg-white focus:ring-2 focus:ring-brand-900/20'

/**
 * @param {{
 *   open: boolean;
 *   onClose: () => void;
 *   categories: Array<{ id: string; name: string; emoji: string }>;
 *   onSubmit: (payload: { name: string; type: string; required: boolean; categoryIds: string[] }) => void;
 * }} props
 */
export function AddPropertyModal({ open, onClose, categories, onSubmit }) {
  const [name, setName] = useState('')
  const [type, setType] = useState('text')
  const [required, setRequired] = useState(false)
  const [selectedCats, setSelectedCats] = useState(() => new Set())
  const [error, setError] = useState('')

  const selectedCount = selectedCats.size

  const toggleCategory = (id) => {
    setSelectedCats((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (error) setError('')
  }

  const reset = () => {
    setName('')
    setType('text')
    setRequired(false)
    setSelectedCats(new Set())
    setError('')
  }

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

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('يرجى إدخال اسم الخاصية.')
      return
    }
    if (selectedCats.size === 0) {
      setError('اختر تصنيفاً واحداً على الأقل.')
      return
    }
    onSubmit({
      name: trimmed,
      type,
      required,
      categoryIds: [...selectedCats],
    })
    handleClose()
  }

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name, 'ar')),
    [categories],
  )

  if (!open) return null

  const overlay = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-prop-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="add-prop-title" className="text-lg font-bold text-slate-900">
            إضافة خاصية جديدة
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
          <div>
            <label htmlFor="prop-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              اسم الخاصية <span className="text-rose-600">*</span>
            </label>
            <input
              id="prop-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              placeholder="مثال: المقاس"
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="prop-type" className="mb-1.5 block text-sm font-semibold text-slate-800">
              نوع الخاصية <span className="text-rose-600">*</span>
            </label>
            <select
              id="prop-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={fieldClass}
            >
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="size-4 rounded border-slate-300 text-[#0056D2] focus:ring-[#0056D2]"
            />
            <span className="text-sm font-semibold text-slate-800">خاصية مطلوبة</span>
          </label>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              التصنيفات المرتبطة <span className="text-rose-600">*</span>
            </p>
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white">
              {sortedCategories.map((c) => {
                const checked = selectedCats.has(c.id)
                return (
                  <label
                    key={c.id}
                    className={[
                      'flex cursor-pointer items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 last:border-b-0',
                      checked ? 'bg-slate-50' : 'hover:bg-slate-50/80',
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                      <span className="text-lg" aria-hidden>
                        {c.emoji}
                      </span>
                      {c.name}
                    </span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(c.id)}
                      className="size-4 rounded border-slate-300 text-[#0056D2] focus:ring-[#0056D2]"
                    />
                  </label>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              تم تحديد {selectedCount} {selectedCount === 1 ? 'تصنيف' : 'تصنيفات'}
            </p>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#0056D2] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0046b0]"
            >
              إضافة الخاصية
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
