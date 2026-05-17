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
  Shirt,
  Sparkles,
  Footprints,
} from 'lucide-react'
import { StatCard } from '../StatCard.jsx'
import { JoinRequestDetailModal } from './JoinRequestDetailModal.jsx'

const cardIcons = [Shirt, Sparkles, Footprints, ShoppingBag]

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
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            قائمة المتاجر
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
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
          iconClassName="bg-sky-100 text-sky-600"
        />
        <StatCard
          label="طلبات التسجيل"
          value={String(requests.length)}
          change="—"
          trend="up"
          icon={Clock}
          iconClassName="bg-amber-100 text-amber-600"
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
          iconClassName="bg-emerald-100 text-emerald-600"
        />
      </div>

      <section
        className="mt-8 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-5 shadow-sm ring-1 ring-amber-100/80"
        dir="rtl"
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-5 text-amber-600" aria-hidden />
          <h2 className="text-lg font-semibold text-slate-900">
            طلبات انضمام المتاجر ({requests.length})
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
          {requests.map((req, i) => {
            const Deco = cardIcons[i % cardIcons.length]
            return (
              <article
                key={req.id}
                className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400 tabular-nums">
                    {req.date}
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Deco className="size-4" aria-hidden />
                  </span>
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
                    className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
                  >
                    <Eye className="size-4" aria-hidden />
                    عرض التفاصيل
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
