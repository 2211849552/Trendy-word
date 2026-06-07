import { createPortal } from 'react-dom'
import { X, User, MapPin, Phone, Mail, ShoppingBag, Calendar, CheckCircle2 } from 'lucide-react'

const STATUS_LABELS = {
  active: 'نشط',
  disabled: 'معطل',
  pending: 'معلق',
}

export function StoreDetailModal({ store, open, loading = false, onClose }) {
  if (!open || !store) return null

  const overlay = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-brand-200 shadow-2xl animate-in zoom-in-95 duration-200" dir="rtl">
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h2 className="text-xl font-bold text-white">تفاصيل المتجر</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors">
            <X className="size-6" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6 space-y-6">
          {loading ? (
            <p className="py-12 text-center text-sm text-white/55">جاري تحميل التفاصيل...</p>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex size-20 items-center justify-center rounded-2xl bg-brand-100 shadow-premium mb-4 overflow-hidden">
                  {store.image ? (
                    <img src={store.image} alt={store.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingBag className="size-10 text-white" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-white">{store.name}</h3>
                <p className="mt-2 text-sm text-white/60 max-w-md mx-auto">
                  {store.description || 'لا يوجد وصف للمتجر.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">التاجر</p>
                    <p className="font-bold text-white mt-1">{store.merchant}</p>
                  </div>
                  <User className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">المنطقة</p>
                    <p className="font-bold text-white mt-1">{store.city}</p>
                  </div>
                  <MapPin className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">البريد الإلكتروني</p>
                    <p className="font-bold text-white mt-1" dir="ltr">{store.email}</p>
                  </div>
                  <Mail className="size-5 text-white/50" />
                </div>
                <div className="rounded-xl bg-brand-300 p-4 border border-white/5 flex items-center justify-between">
                  <div className="text-right">
                    <p className="text-xs text-white/60">الهاتف</p>
                    <p className="font-bold text-white mt-1 tabular-nums" dir="ltr">{store.phone}</p>
                  </div>
                  <Phone className="size-5 text-white/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6">
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
                  <div className="text-right">
                    <p className="text-xs text-white/60">تاريخ الإنشاء</p>
                    <p className="font-bold text-white mt-1 tabular-nums">{store.createdAt || '—'}</p>
                  </div>
                  <Calendar className="size-5 text-white/50" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5">
                  <div className="text-right">
                    <p className="text-xs text-white/60">نوع المتجر</p>
                    <p className="font-bold text-white mt-1">{store.type || '—'}</p>
                  </div>
                  <ShoppingBag className="size-5 text-white/50" />
                </div>
                <div className="flex items-center justify-between rounded-xl bg-brand-300 p-4 border border-white/5 md:col-span-2">
                  <div className="text-right">
                    <p className="text-xs text-white/60">الحالة</p>
                    <span className={`mt-1 inline-flex rounded-full px-3 py-0.5 text-xs font-bold ${
                      store.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : store.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}>
                      {STATUS_LABELS[store.status] ?? store.status}
                    </span>
                    {store.deactivationReason ? (
                      <p className="mt-2 text-xs text-white/55">سبب التعطيل: {store.deactivationReason}</p>
                    ) : null}
                  </div>
                  <CheckCircle2 className="size-5 text-white/50" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-brand-300 border-t border-white/5">
          <button onClick={onClose} className="w-full rounded-xl bg-slate-900 py-3.5 text-sm font-bold text-white shadow-premium hover:bg-slate-800 transition-all active:scale-95">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
