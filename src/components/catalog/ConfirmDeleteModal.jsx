import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

/**
 * @param {{
 *   open: boolean;
 *   title?: string;
 *   message: string;
 *   onCancel: () => void;
 *   onConfirm: () => void;
 * }} props
 */
export function ConfirmDeleteModal({ open, title = 'تأكيد الحذف', message, onCancel, onConfirm }) {
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
      if (e.key === 'Escape') onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const overlay = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="confirm-delete-title" className="text-lg font-bold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>
        <p id="confirm-delete-desc" className="mt-4 text-sm leading-relaxed text-slate-600">
          {message}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.()}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
          >
            حذف نهائياً
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
