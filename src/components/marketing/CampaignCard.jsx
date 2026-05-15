import { Eye, Pencil, Play, Pause, Trash2 } from 'lucide-react'
import { statusLabels, statusBadgeClass } from '../../data/campaigns.js'

function fmtNum(n) {
  return n.toLocaleString('ar-LY')
}

export function CampaignCard({ campaign, onView, onEdit, onToggle, onDelete }) {
  const badge = statusBadgeClass[campaign.status] ?? statusBadgeClass.finished

  return (
    <article
      className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badge}`}
        >
          {statusLabels[campaign.status]}
        </span>
        <span className="text-2xl leading-none" aria-hidden>
          {campaign.emoji}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-slate-900">{campaign.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">{campaign.description}</p>

      <p className="mt-3 text-sm font-medium text-slate-500">المتجر</p>
      <p className="text-sm font-semibold text-slate-800">{campaign.storeName}</p>

      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
        <li className="flex justify-between gap-2">
          <span className="font-bold tabular-nums text-violet-600">{fmtNum(campaign.stores)}</span>
          <span className="text-slate-500">عدد المتاجر</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="font-bold tabular-nums text-orange-600">{fmtNum(campaign.products)}</span>
          <span className="text-slate-500">عدد المنتجات</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className="font-bold tabular-nums text-emerald-600">{fmtNum(campaign.views)}</span>
          <span className="text-slate-500">المشاهدات</span>
        </li>
      </ul>

      <p className="mt-3 text-xs text-slate-500">
        من <span className="tabular-nums font-medium text-slate-700">{campaign.dateFrom}</span> إلى{' '}
        <span className="tabular-nums font-medium text-slate-700">{campaign.dateTo}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onView?.(campaign)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 min-[420px]:flex-none"
        >
          <Eye className="size-4 shrink-0" aria-hidden />
          عرض
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(campaign)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 min-[420px]:flex-none"
        >
          <Pencil className="size-4 shrink-0" aria-hidden />
          تعديل
        </button>
        <button
          type="button"
          onClick={() => onToggle?.(campaign)}
          className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          aria-label="تشغيل أو إيقاف"
        >
          {campaign.paused ? (
            <Play className="size-4" aria-hidden />
          ) : (
            <Pause className="size-4" aria-hidden />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(campaign)}
          className="flex size-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm hover:bg-rose-100"
          aria-label="حذف"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  )
}
