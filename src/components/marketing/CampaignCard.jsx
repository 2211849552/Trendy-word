import { Eye, Pencil, Play, Pause, Trash2 } from 'lucide-react'
import { statusLabels, statusBadgeClass } from '../../data/campaigns.js'
import { CAMPAIGN_METRICS } from '../../theme/chartColors.js'

function fmtNum(n) {
  return n.toLocaleString('ar-LY')
}

export function CampaignCard({ campaign, onView, onEdit, onToggle, onDelete }) {
  const badge = statusBadgeClass[campaign.status] ?? statusBadgeClass.finished
  
  // Custom display for status if paused
  const isStopped = campaign.paused || campaign.status === 'stopped'
  const displayStatus = isStopped ? 'متوقف' : statusLabels[campaign.status]
  const displayBadge = isStopped ? statusBadgeClass.stopped : badge

  return (
    <article
      className="flex flex-col rounded-2xl bg-brand-200 p-5 shadow-premium ring-1 ring-slate-100/80"
      dir="rtl"
    >
      <div className="flex items-start justify-end gap-2">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${displayBadge}`}
        >
          {displayStatus}
        </span>
      </div>

      <h3 className="mt-3 text-lg font-bold text-white">{campaign.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/70">{campaign.description}</p>

      <p className="mt-3 text-sm font-medium text-white/60">المتجر</p>
      <p className="text-sm font-semibold text-white/90">{campaign.storeName}</p>

      <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm">
        <li className="flex justify-between gap-2">
          <span className={`font-bold tabular-nums ${CAMPAIGN_METRICS.stores.value}`}>
            {fmtNum(campaign.stores)}
          </span>
          <span className="text-white/60">عدد المتاجر</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className={`font-bold tabular-nums ${CAMPAIGN_METRICS.products.value}`}>
            {fmtNum(campaign.products)}
          </span>
          <span className="text-white/60">عدد المنتجات</span>
        </li>
        <li className="flex justify-between gap-2">
          <span className={`font-bold tabular-nums ${CAMPAIGN_METRICS.views.value}`}>
            {fmtNum(campaign.views)}
          </span>
          <span className="text-white/60">المشاهدات</span>
        </li>
      </ul>

      <p className="mt-3 text-xs text-white/60">
        من <span className="tabular-nums font-medium text-white/80">{campaign.dateFrom}</span> إلى{' '}
        <span className="tabular-nums font-medium text-white/80">{campaign.dateTo}</span>
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => onView?.(campaign)}
          className="btn-action-solid flex-1 min-[420px]:flex-none"
        >
          <Eye className="size-4 shrink-0" aria-hidden />
          عرض
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(campaign)}
          className="btn-action-solid flex-1 min-[420px]:flex-none"
        >
          <Pencil className="size-4 shrink-0" aria-hidden />
          تعديل
        </button>
        <button
          type="button"
          onClick={() => onToggle?.(campaign)}
          className={`flex size-10 items-center justify-center rounded-xl border shadow-premium transition-colors ${
            campaign.paused 
              ? 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
              : 'border-white/10 bg-brand-200 text-white/70 hover:bg-brand-300'
          }`}
          aria-label={campaign.paused ? "تفعيل" : "إلغاء تفعيل"}
          title={campaign.paused ? "تفعيل" : "إلغاء تفعيل"}
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
          className="flex size-10 items-center justify-center rounded-xl border border-rose-100 bg-rose-50 text-rose-600 shadow-premium hover:bg-rose-100"
          aria-label="حذف"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </article>
  )
}
