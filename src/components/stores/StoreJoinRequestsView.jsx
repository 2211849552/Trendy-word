import { useState, useEffect } from 'react'
import {
  Store,
  Ban,
  Clock,
  ShoppingBag,
  Download,
  Eye,
  Check,
  X,
  User,
  Mail,
  MapPin,
} from 'lucide-react'
import { StatCard } from '../StatCard.jsx'
import { JoinRequestDetailModal } from './JoinRequestDetailModal.jsx'
import { StoreImage } from './StoreImage.jsx'

export function StoreJoinRequestsView({ requests, registeredStores = [], loading = false, onAccept, onReject, onLoadRequest, onOpenList, initialRequestId, onClearInitialRequestId }) {
  const [modalRequestId, setModalRequestId] = useState(initialRequestId ? String(initialRequestId) : null)
  const modalRequest = requests.find((r) => r.id === modalRequestId) ?? null

  useEffect(() => {
    if (initialRequestId) {
      setModalRequestId(String(initialRequestId))
      onLoadRequest?.(String(initialRequestId))
      onClearInitialRequestId?.()
    }
  }, [initialRequestId, onLoadRequest, onClearInitialRequestId])

  const openDetails = (id) => {
    setModalRequestId(id)
    onLoadRequest?.(id)
  }

  const handlePrint = () => {
    // Basic implementation for printing the page
    window.print()
  }

  const activeCount = registeredStores.filter(s => s.status === 'active').length;
  const bannedCount = registeredStores.filter(s => s.status === 'disabled').length;
  const totalProducts = registeredStores.reduce((sum, s) => sum + (s.products || 0), 0);


  return (
    <>
      <JoinRequestDetailModal
        request={modalRequest}
        open={Boolean(modalRequestId)}
        onClose={() => setModalRequestId(null)}
        onAccept={(id) => {
          onAccept(id)
        }}
        onReject={(id, reason) => {
          onReject(id, reason)
        }}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            إدارة المتاجر
          </h1>
          <p className="mt-1 text-white/60">
            إدارة شاملة للمتاجر المسجلة في المنصة
          </p>
        </header>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenList}
            className="rounded-xl border border-brand-200 bg-brand-200 px-4 py-2.5 text-sm font-semibold text-white shadow-premium transition-colors hover:bg-brand-100"
          >
            قائمة المتاجر
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm"
          >
            <Download className="size-4" aria-hidden />
            طباعة قائمة المتاجر
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المنتجات"
          value={String(totalProducts)}
          icon={ShoppingBag}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
        <StatCard
          label="طلبات التسجيل"
          value={String(requests.length)}
          change="—"
          trend="up"
          icon={Clock}
          iconClassName="bg-brand-300 text-white"
        />
        <StatCard
          label="المتاجر المحظورة"
          value={String(bannedCount)}
          change="—"
          trend="up"
          icon={Ban}
          iconClassName="bg-rose-100 text-rose-600"
        />
        <StatCard
          label="المتاجر النشطة"
          value={String(activeCount)}
          icon={Store}
          iconClassName="bg-brand-300 text-white/90"
          omitChange
        />
      </div>

      <section
        className="mt-8 rounded-2xl border border-brand-200/80 bg-brand-100/50 p-5 shadow-premium ring-1 ring-brand-100/80"
        dir="rtl"
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5 text-white" aria-hidden />
          <h2 className="text-lg font-semibold text-white">
            طلبات انضمام المتاجر ({requests.length})
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {loading ? (
            <p className="col-span-full py-8 text-center text-sm text-white/55">جاري تحميل الطلبات...</p>
          ) : requests.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-white/55">لا توجد طلبات انضمام معلقة.</p>
          ) : (
          requests.map((req) => (
              <article
                key={req.id}
                className="flex flex-col rounded-2xl bg-brand-200 p-5 shadow-premium ring-1 ring-slate-100/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-white/50 tabular-nums">
                    {req.date}
                  </span>
                  <StoreImage
                    src={req.image}
                    name={req.storeName}
                    className="size-10 shrink-0 rounded-lg ring-1 ring-slate-100"
                  />
                </div>
                <h3 className="mt-3 text-base font-bold leading-snug text-white">
                  {req.storeName}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-white/70">
                  <li className="flex items-center gap-2">
                    <User className="size-4 shrink-0 text-white/50" aria-hidden />
                    {req.owner || '—'}
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-white/50" aria-hidden />
                    {req.email || '—'}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-white/50" aria-hidden />
                    {req.phone || req.city || '—'}
                  </li>
                </ul>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openDetails(req.id)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 text-sm font-semibold text-white shadow-premium transition-colors hover:bg-brand-950"
                  >
                    <Eye className="size-4" aria-hidden />
                    عرض التفاصيل
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  )
}
