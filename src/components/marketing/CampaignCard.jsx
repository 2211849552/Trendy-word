import { Eye, ImageIcon, Pencil, Play, Pause, Trash2 } from 'lucide-react'
import { formatCampaignDateDisplay } from '../../api/adminCampaigns.js'
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
      className="flex flex-col overflow-hidden rounded-2xl bg-brand-200 shadow-premium ring-1 ring-slate-100/80"
      dir="rtl"
    >
      <div className="relative h-40 w-full shrink-0 bg-brand-300/50">
        {campaign.bannerImageUrl ? (
          <img
            src={campaign.bannerImageUrl}
            alt={`صورة إعلان ${campaign.title}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/35">
            <ImageIcon className="size-10" aria-hidden />
            <span className="text-xs">لا توجد صورة</span>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 backdrop-blur-sm ${displayBadge}`}
        >
          {displayStatus}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
      <h3 className="text-lg font-bold text-white">{campaign.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-white/70">{campaign.description}</p>

      {campaign.link ? (
        <>
          <p className="mt-3 text-sm font-medium text-white/60">رابط الحملة</p>
          <p className="truncate text-sm font-semibold text-white/90" dir="ltr">
            {campaign.link}
          </p>
        </>
      ) : null}

      <ul className="mt-4 space-y-2 border-t border-white/5 pt-4 text-sm">
        <li className="flex justify-between gap-2">
          <span className="font-bold text-white tabular-nums">
            {campaign.price ? `${fmtNum(Number(campaign.price))} د.ل` : '0 د.ل'}
          </span>
          <span className="text-white/60">سعر الاشتراك</span>
        </li>
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
        من{' '}
        <span dir="ltr" className="tabular-nums font-medium text-white/80">
          {formatCampaignDateDisplay(campaign.dateFrom)}
        </span>{' '}
        إلى{' '}
        <span dir="ltr" className="tabular-nums font-medium text-white/80">
          {formatCampaignDateDisplay(campaign.dateTo)}
        </span>
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
      </div>
    </article>
  )
}
