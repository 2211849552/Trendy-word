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
  const [modalState, setModalState] = useState('details') // 'details', 'confirmAccept', 'confirmReject', 'success'
  const [successType, setSuccessType] = useState('accept') // 'accept', 'reject'
  const [rejectReason, setRejectReason] = useState('')
  const [reasonError, setReasonError] = useState('')

  useEffect(() => {
    if (!open) {
      setModalState('details')
      setRejectReason('')
      setReasonError('')
    }
  }, [open])

  if (!open || !request) return null

  const handleDocClick = () => {
    // Document preview logic would go here
  }

  const confirmAccept = () => {
    onAccept?.(request.id)
    setSuccessType('accept')
    setModalState('success')
  }

  const confirmRejectAction = () => {
    const trimmed = rejectReason.trim()
    if (!trimmed) {
      setReasonError('يرجى كتابة سبب الرفض')
      return
    }
    onReject?.(request.id, trimmed)
    setSuccessType('reject')
    setModalState('success')
  }

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-slate-900">
            {modalState === 'confirmAccept' ? 'تأكيد قبول المتجر' : 
             modalState === 'confirmReject' ? 'تأكيد رفض المتجر' : 
             modalState === 'success' ? 'تم الإجراء بنجاح' :
             'تفاصيل طلب الانضمام'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-5 py-6">
          {modalState === 'success' ? (
            <div className="text-center animate-in zoom-in-95 duration-300">
              <div className={`mx-auto flex size-20 items-center justify-center rounded-full mb-4 border-4 ${
                successType === 'accept' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
              }`}>
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {successType === 'accept' ? 'تم قبول المتجر بنجاح!' : 'تم رفض الطلب بنجاح'}
              </h3>
              <p className="text-sm text-slate-500 mb-8 px-4 leading-relaxed">
                {successType === 'accept' 
                  ? `تم تفعيل حساب متجر «${request.storeName}» وسيتم إرسال بريد إلكتروني لإبلاغهم بالقبول.`
                  : `تم إرسال سبب الرفض إلى متجر «${request.storeName}» عبر البريد الإلكتروني.`}
              </p>
              <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                إغلاق النافذة
              </button>
            </div>
          ) : modalState === 'confirmAccept' ? (
            <div className="text-center animate-in zoom-in-95 duration-200">
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border-4 border-emerald-100">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">هل أنت متأكد من قبول المتجر؟</h3>
              <p className="text-sm text-slate-500 mb-8 px-4">
                بمجرد القبول، سيتمكن متجر <span className="font-bold text-slate-900">«{request.storeName}»</span> من البدء في رفع منتجاته واستقبال الطلبات.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmAccept} className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
                  تأكيد القبول والارسال
                </button>
                <button onClick={() => setModalState('details')} className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                  رجوع
                </button>
              </div>
            </div>
          ) : modalState === 'confirmReject' ? (
            <div className="animate-in zoom-in-95 duration-200">
              <div className="text-center mb-6">
                <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-rose-50 text-rose-600 mb-4 border-4 border-rose-100">
                  <X className="size-10" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">رفض طلب الانضمام</h3>
                <p className="text-sm text-slate-500">
                  يرجى توضيح سبب الرفض ليتم إرساله للمتجر <span className="font-bold">{request.storeName}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">سبب الرفض <span className="text-rose-500">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value)
                      if (reasonError) setReasonError('')
                    }}
                    rows={4}
                    placeholder="مثال: المستندات المرفقة غير واضحة، أو المتجر لا يستوفي الشروط..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                  {reasonError && <p className="mt-1.5 text-xs font-bold text-rose-600">{reasonError}</p>}
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={confirmRejectAction} className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-rose-700 transition-all active:scale-95">
                    تأكيد الرفض والارسال
                  </button>
                  <button onClick={() => setModalState('details')} className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                    رجوع
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
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
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setModalState('confirmAccept')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                  قبول الطلب
                </button>
                <button
                  type="button"
                  onClick={() => setModalState('confirmReject')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-rose-700"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                    <X className="size-3.5" strokeWidth={3} aria-hidden />
                  </span>
                  رفض الطلب
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
