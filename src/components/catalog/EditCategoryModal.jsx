import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { CLOTHING_ICON_OPTIONS, CLOTHING_SIZES } from '../../data/catalog.js'

const fieldClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-900 focus:bg-white focus:ring-2 focus:ring-brand-900/20'

/**
 * @param {{
 *   category: { id: string; name: string; emoji: string; sizes?: string[] };
 *   onClose: () => void;
 *   onSave: (payload: { id: string; name: string; emoji: string; sizes: string[] }) => void;
 * }} props
 */
export function EditCategoryModal({ category, onClose, onSave }) {
  const [name, setName] = useState(category.name)
  const [emoji, setEmoji] = useState(category.emoji)
  const [sizes, setSizes] = useState(() => new Set(category.sizes?.length ? category.sizes : CLOTHING_SIZES))
  const [error, setError] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleSize = (s) => {
    setSizes((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
    if (error) setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError('يرجى إدخال اسم التصنيف.')
      return
    }
    if (sizes.size === 0) {
      setError('اختر مقاساً واحداً على الأقل (S، M، L، XL).')
      return
    }
    const ordered = CLOTHING_SIZES.filter((s) => sizes.has(s))
    onSave({ id: category.id, name: trimmed, emoji, sizes: ordered })
    onClose()
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
        aria-labelledby="edit-category-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="edit-category-title" className="text-lg font-bold text-slate-900">
            تعديل التصنيف
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

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
          <div>
            <label htmlFor="edit-cat-name" className="mb-1.5 block text-sm font-semibold text-slate-800">
              اسم التصنيف
            </label>
            <input
              id="edit-cat-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (error) setError('')
              }}
              className={fieldClass}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">الأيقونة</p>
            <div className="flex flex-wrap items-center gap-3">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl"
                aria-hidden
              >
                {emoji}
              </div>
              <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                <div className="flex w-max gap-2 pb-1">
                  {CLOTHING_ICON_OPTIONS.map((icon) => {
                    const selected = icon === emoji
                    return (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setEmoji(icon)}
                        className={[
                          'flex size-11 shrink-0 items-center justify-center rounded-lg text-xl transition',
                          selected
                            ? 'bg-[#0056D2] text-white ring-2 ring-[#0056D2]/30'
                            : 'bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-100',
                        ].join(' ')}
                        aria-pressed={selected}
                        aria-label={`اختيار أيقونة ${icon}`}
                      >
                        {icon}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">المقاسات المتاحة</p>
            <p className="mb-2 text-xs text-slate-500">اختر المقاسات التي يدعمها هذا التصنيف (S، M، L، XL)</p>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_SIZES.map((s) => {
                const on = sizes.has(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSize(s)}
                    className={[
                      'min-w-[3rem] rounded-xl px-4 py-2 text-sm font-bold tabular-nums transition',
                      on
                        ? 'bg-[#0056D2] text-white ring-2 ring-[#0056D2]/25'
                        : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200 hover:bg-slate-200',
                    ].join(' ')}
                    aria-pressed={on}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

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
              className="rounded-xl bg-[#0056D2] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#0046b0]"
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
