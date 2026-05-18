import { useState } from 'react'
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

export function StoreJoinRequestsView({ requests, onAccept, onReject, onOpenList }) {
  const [modalRequestId, setModalRequestId] = useState(null)
  const modalRequest = requests.find((r) => r.id === modalRequestId) ?? null

  const handlePrint = () => {
    // Basic implementation for printing the page
    window.print()
  }

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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            إدارة المتاجر
          </h1>
          <p className="mt-1 text-slate-500">
            إدارة شاملة للمتاجر المسجلة في المنصة
          </p>
        </header>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenList}
            className="rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-colors hover:bg-brand-50"
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المنتجات"
          value="902"
          change="8%"
          trend="up"
          icon={ShoppingBag}
          iconClassName="bg-brand-100 text-brand-800"
        />
        <StatCard
          label="طلبات التسجيل"
          value={String(requests.length)}
          change="—"
          trend="up"
          icon={Clock}
          iconClassName="bg-brand-100 text-brand-950"
        />
        <StatCard
          label="المتاجر المحظورة"
          value="1"
          change="—"
          trend="up"
          icon={Ban}
          iconClassName="bg-rose-100 text-rose-600"
        />
        <StatCard
          label="المتاجر النشطة"
          value="4"
          change="12%"
          trend="up"
          icon={Store}
          iconClassName="bg-brand-100 text-brand-800"
        />
      </div>

      <section
        className="mt-8 rounded-2xl border border-brand-200/80 bg-brand-50/50 p-5 shadow-sm ring-1 ring-brand-100/80"
        dir="rtl"
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5 text-brand-950" aria-hidden />
          <h2 className="text-lg font-semibold text-brand-950">
            طلبات انضمام المتاجر ({requests.length})
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {requests.map((req) => (
              <article
                key={req.id}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400 tabular-nums">
                    {req.date}
                  </span>
                  <StoreImage
                    src={req.image}
                    name={req.storeName}
                    className="size-10 shrink-0 rounded-lg ring-1 ring-slate-100"
                  />
                </div>
                <h3 className="mt-3 text-base font-bold leading-snug text-slate-900">
                  {req.storeName}
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <User className="size-4 shrink-0 text-slate-400" aria-hidden />
                    {req.owner}
                  </li>
                  <li className="flex items-center gap-2">
                    <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
                    {req.email}
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
                    {req.city}
                  </li>
                </ul>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalRequestId(req.id)}
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-900 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-950"
                  >
                    <Eye className="size-4" aria-hidden />
                    عرض التفاصيل
                  </button>
                </div>
              </article>
            ))}
        </div>
      </section>
    </>
  )
}
