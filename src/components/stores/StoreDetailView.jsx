import {
  ArrowLeft,
  User,
  Mail,
  MapPin,
  Eye,
  Check,
  X,
  LayoutGrid,
} from 'lucide-react'
import { joinRequests } from '../../data/stores.js'
import { StoreRatingChart } from './StoreRatingChart.jsx'

export function StoreDetailView({ requestId, onBack }) {
  const store =
    joinRequests.find((r) => r.id === requestId) ?? joinRequests[0]

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-800"
      >
        <ArrowLeft className="size-4" aria-hidden />
        العودة إلى طلبات الانضمام
      </button>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
          إدارة المتاجر
        </h1>
        <p className="mt-1 text-slate-500">تفاصيل طلب الانضمام</p>
      </header>

      <div className="space-y-8">
        <article
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
          dir="rtl"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-slate-400 tabular-nums">
              2026-04-20
            </span>
            <span
              className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 via-violet-500 to-amber-400 shadow-inner"
              aria-hidden
            >
              <LayoutGrid className="size-5 text-white opacity-90" />
            </span>
          </div>
          <h2 className="mt-4 text-center text-xl font-bold text-slate-900">
            {store.storeName}
          </h2>
          <ul className="mx-auto mt-5 max-w-md space-y-3 text-sm text-slate-600">
            <li className="flex items-center justify-center gap-2">
              <User className="size-4 shrink-0 text-slate-400" aria-hidden />
              {store.owner}
            </li>
            <li className="flex items-center justify-center gap-2">
              <Mail className="size-4 shrink-0 text-slate-400" aria-hidden />
              {store.email}
            </li>
            <li className="flex items-center justify-center gap-2">
              <MapPin className="size-4 shrink-0 text-slate-400" aria-hidden />
              {store.city}
            </li>
          </ul>
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-sm hover:bg-rose-50"
              aria-label="رفض"
            >
              <X className="size-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-emerald-600 shadow-sm hover:bg-emerald-50"
              aria-label="قبول"
            >
              <Check className="size-5" strokeWidth={2.5} />
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-sky-700"
            >
              <Eye className="size-4" aria-hidden />
              عرض
            </button>
          </div>
        </article>

        <StoreRatingChart />
      </div>
    </>
  )
}
