import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle2 } from 'lucide-react'
import { StoreImage } from './StoreImage.jsx'

function InfoCard({ label, value, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-white/5 bg-brand-300/90 px-4 py-3 ${className}`}
    >
      <p className="text-xs font-medium text-white/60">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
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
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/5 bg-brand-200/95 px-5 py-4 backdrop-blur">
          <h2 className="text-lg font-bold text-white">
            {modalState === 'confirmAccept' ? 'تأكيد قبول المتجر' : 
             modalState === 'confirmReject' ? 'تأكيد رفض المتجر' : 
             modalState === 'success' ? 'تم الإجراء بنجاح' :
             'تفاصيل طلب الانضمام'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-white/50 transition-colors hover:bg-brand-300 hover:text-white/70"
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
              <h3 className="text-2xl font-bold text-white mb-2">
                {successType === 'accept' ? 'تم قبول المتجر بنجاح!' : 'تم رفض الطلب بنجاح'}
              </h3>
              <p className="text-sm text-white/60 mb-8 px-4 leading-relaxed">
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
              <h3 className="text-xl font-bold text-white mb-2">هل أنت متأكد من قبول المتجر؟</h3>
              <p className="text-sm text-white/60 mb-8 px-4">
                بمجرد القبول، سيتمكن متجر <span className="font-bold text-white">«{request.storeName}»</span> من البدء في رفع منتجاته واستقبال الطلبات.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={confirmAccept} className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
                  تأكيد القبول والارسال
                </button>
                <button onClick={() => setModalState('details')} className="w-full rounded-xl border border-white/10 py-3.5 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">
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
                <h3 className="text-xl font-bold text-white mb-1">رفض طلب الانضمام</h3>
                <p className="text-sm text-white/60">
                  يرجى توضيح سبب الرفض ليتم إرساله للمتجر <span className="font-bold">{request.storeName}</span>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-white/80">سبب الرفض <span className="text-rose-500">*</span></label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => {
                      setRejectReason(e.target.value)
                      if (reasonError) setReasonError('')
                    }}
                    rows={4}
                    placeholder="مثال: المستندات المرفقة غير واضحة، أو المتجر لا يستوفي الشروط..."
                    className="w-full rounded-xl border border-white/10 bg-brand-300 p-4 text-sm outline-none focus:border-rose-300 focus:bg-brand-200 focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                  {reasonError && <p className="mt-1.5 text-xs font-bold text-rose-600">{reasonError}</p>}
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={confirmRejectAction} className="w-full rounded-xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-lg hover:bg-rose-700 transition-all active:scale-95">
                    تأكيد الرفض والارسال
                  </button>
                  <button onClick={() => setModalState('details')} className="w-full rounded-xl border border-white/10 py-3.5 text-sm font-bold text-white/80 hover:bg-brand-300 transition-colors">
                    رجوع
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <StoreImage
                  src={request.image}
                  name={request.storeName}
                  className="mx-auto size-24 rounded-2xl shadow-premium ring-2 ring-slate-100"
                />
                <h3 className="mt-4 text-xl font-bold text-white">{request.storeName}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  {request.description}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-amber-100 px-4 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                  {request.status}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <InfoCard label="اسم التاجر" value={request.owner} />
                <InfoCard label="منطقة المتجر" value={request.city || '—'} />
                <InfoCard label="البريد الإلكتروني" value={request.email} />
                <InfoCard label="رقم الهاتف" value={request.phone} />
                <InfoCard
                  label="نوع التجارة"
                  value={request.businessType}
                />
                <InfoCard
                  label="تاريخ الطلب"
                  value={request.date}
                  className="border-brand-100 bg-brand-100/90"
                />
              </div>

              {request.sampleProducts?.length > 0 && (
                <div>
                  <p className="mb-3 text-sm font-semibold text-white/90">عينات المنتجات المقترحة</p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {request.sampleProducts.map((product, idx) => (
                      <article
                        key={`${product.name}-${idx}`}
                        className="overflow-hidden rounded-xl border border-white/5 bg-brand-200 shadow-premium ring-1 ring-slate-50"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-28 w-full object-cover"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="p-3 text-right">
                          <p className="text-sm font-bold leading-snug text-white">{product.name}</p>
                          <p className="mt-1 text-xs text-white/60">{product.category}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
                <button
                  type="button"
                  onClick={() => setModalState('confirmAccept')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 text-sm font-bold text-white shadow-premium transition-colors hover:bg-emerald-700"
                >
                  <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                  قبول الطلب
                </button>
                <button
                  type="button"
                  onClick={() => setModalState('confirmReject')}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-rose-600 px-3 text-sm font-bold text-white shadow-premium transition-colors hover:bg-rose-700"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand-200/20">
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
