import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Loader2, Trash2, X } from 'lucide-react'

const TONE_STYLES = {
  danger: {
    iconWrap: 'bg-rose-500/10 text-rose-300 ring-1 ring-rose-500/20',
    confirm: 'bg-rose-600 hover:bg-rose-700',
  },
  warning: {
    iconWrap: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20',
    confirm: 'bg-gradient-to-r from-brand-700 to-[#4285f4] hover:opacity-90',
  },
  primary: {
    iconWrap: 'bg-brand-500/15 text-brand-600 ring-1 ring-brand-500/25',
    confirm: 'bg-gradient-to-r from-brand-700 to-[#4285f4] hover:opacity-90',
  },
}

/**
 * @param {{
 *   open: boolean;
 *   title?: string;
 *   heading?: string;
 *   itemName?: string;
 *   message?: import('react').ReactNode;
 *   onCancel: () => void;
 *   onConfirm: () => void;
 *   loading?: boolean;
 *   confirmLabel?: string;
 *   tone?: 'danger' | 'warning' | 'primary';
 *   icon?: import('lucide-react').LucideIcon;
 * }} props
 */
export function ConfirmDeleteModal({
  open,
  title = 'تأكيد الحذف',
  heading = 'هل أنت متأكد؟',
  itemName,
  message,
  onCancel,
  onConfirm,
  loading = false,
  confirmLabel = 'تأكيد الحذف',
  tone = 'danger',
  icon: Icon = Trash2,
}) {
  const toneStyle = TONE_STYLES[tone] ?? TONE_STYLES.danger
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
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel, loading])

  if (!open) return null

  const description = message ?? (
    itemName ? (
      <>
        أنت على وشك حذف <span className="font-bold text-white">«{itemName}»</span> نهائياً.
        لا يمكن التراجع عن هذا الإجراء.
      </>
    ) : (
      'لا يمكن التراجع عن هذا الإجراء بعد التأكيد.'
    )
  )

  const overlay = (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        aria-label="إغلاق"
        disabled={loading}
        onClick={() => !loading && onCancel?.()}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-desc"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-white/10 animate-in zoom-in-95 duration-200"
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
          <h2 id="confirm-delete-title" className="text-lg font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors disabled:opacity-50"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="p-6 text-center">
          <div className={`mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl ${toneStyle.iconWrap}`}>
            <Icon className="size-8" />
          </div>
          <h3 className="text-xl font-bold text-white">{heading}</h3>
          <p id="confirm-delete-desc" className="mt-2 text-sm leading-relaxed text-white/60">
            {description}
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-white/5 bg-brand-300 p-5 sm:flex-row-reverse sm:gap-3">
          <button
            type="button"
            onClick={() => onConfirm?.()}
            disabled={loading}
            className={`inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold text-white shadow-premium transition-colors disabled:opacity-60 ${toneStyle.confirm}`}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-4 text-sm font-bold text-white/80 shadow-premium transition-colors hover:bg-brand-300 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
