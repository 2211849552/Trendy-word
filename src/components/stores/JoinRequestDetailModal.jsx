import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Gift, FileText, CheckCircle2 } from 'lucide-react'

function InfoCard({ label, value, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3 ${className}`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  )
}

export function JoinRequestDetailModal({
  request,
  open,
  onClose,
  onAccept,
  onReject,
}) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  useEffect(() => {
    if (!open) {
      setRejectOpen(false)
      setRejectReason('')
      setReasonError('')
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
      if (e.key !== 'Escape') return
      if (rejectOpen) {
        setRejectOpen(false)
        setRejectReason('')
        setReasonError('')
      } else {
        onClose?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, rejectOpen])

  if (!open || !request) return null

  const handleDocClick = () => {
    window.alert(
      `معاينة الوثيقة: ${request.documentFile}\n(في التطبيق الحقيقي تُفتح ملف PDF أو رابط التخزين السحابي.)`,
    )
  }

  const confirmReject = () => {
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setReasonError('يرجى كتابة سبب الرفض')
      return
    }
    setReasonError('')
    onReject?.(request.id, trimmed)
    setRejectOpen(false)
    setRejectReason('')
    onClose?.()
  }

  const cancelReject = () => {
    setRejectOpen(false)
    setRejectReason('')
    setReasonError('')
  }

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={() => {
          if (rejectOpen) cancelReject()
          else onClose?.()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-request-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 id="join-request-title" className="text-lg font-bold text-slate-900">
            {rejectOpen ? 'رفض الطلب' : 'تفاصيل طلب الانضمام'}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (rejectOpen) cancelReject()
              else onClose?.()
            }}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label={rejectOpen ? 'إلغاء الرفض' : 'إغلاق'}
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="relative space-y-6 px-5 py-6">
          {rejectOpen ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                المتجر: <span className="font-semibold text-slate-900">{request.storeName}</span>
              </p>
              <div>
                <label htmlFor="reject-reason" className="mb-2 block text-sm font-semibold text-slate-800">
                  سبب الرفض <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="reject-reason"
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value)
                    if (reasonError) setReasonError('')
                  }}
                  rows={4}
                  placeholder="اكتب سبب رفض الطلب بوضوح (مثال: وثيقة غير مكتملة، عدم مطابقة الشروط…)"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm text-slate-900 outline-none ring-rose-500/20 transition placeholder:text-slate-400 focus:border-rose-300 focus:bg-white focus:ring-2"
                />
                {reasonError ? (
                  <p className="mt-1.5 text-xs font-medium text-rose-600">{reasonError}</p>
                ) : null}
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelReject}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  رجوع
                </button>
                <button
                  type="button"
                  onClick={confirmReject}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-rose-700"
                >
                  تأكيد الرفض
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 shadow-md ring-2 ring-amber-200/80">
                  <Gift className="size-8 text-amber-950/90" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900">{request.storeName}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                  {request.description}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCard label="اسم التاجر" value={request.owner} />
                <InfoCard label="الموقع" value={request.city} />
                <InfoCard label="البريد الإلكتروني" value={request.email} />
                <InfoCard label="رقم الهاتف" value={request.phone} />
                <InfoCard
                  label="نوع التجارة"
                  value={request.businessType}
                  className="border-violet-100 bg-violet-50/90"
                />
                <InfoCard
                  label="تاريخ الطلب"
                  value={request.date}
                  className="border-sky-100 bg-sky-50/90"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-semibold text-slate-800">الوثيقة الرسمية</p>
                <button
                  type="button"
                  onClick={handleDocClick}
                  className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-start text-sm text-amber-950 transition-colors hover:bg-amber-100/90"
                >
                  <FileText className="size-5 shrink-0 text-amber-700" aria-hidden />
                  <span className="min-w-0 font-medium break-all" dir="ltr">
                    {request.documentFile}
                  </span>
                </button>
                <p className="mt-1.5 text-xs text-slate-500">انقر لمعاينة أو تنزيل الوثيقة (واجهة تجريبية)</p>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    onAccept?.(request.id)
                    onClose?.()
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                  قبول الطلب
                </button>
                <button
                  type="button"
                  onClick={() => setRejectOpen(true)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                    <X className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  رفض الطلب
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
