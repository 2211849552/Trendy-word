import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { statusLabels, statusBadgeClass } from '../../data/campaigns.js'
import { CAMPAIGN_METRICS } from '../../theme/chartColors.js'

export function CampaignDetailModal({ campaign, open, onClose }) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open || !campaign) return null

  const isStopped = campaign.paused || campaign.status === 'stopped'
  const displayStatus = isStopped ? 'متوقف' : statusLabels[campaign.status]
  const statusClass = isStopped
    ? statusBadgeClass.stopped
    : (statusBadgeClass[campaign.status] ?? statusBadgeClass.finished)

  const overlay = (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]"
        aria-label="إغلاق"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="campaign-detail-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/80"
        dir="rtl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
          <h2 id="campaign-detail-title" className="text-lg font-bold text-slate-900">
            تفاصيل الحملة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="إغلاق"
          >
            <X className="size-5" strokeWidth={2.25} />
          </button>
        </div>

        <div className="space-y-6 px-5 py-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900">{campaign.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{campaign.description}</p>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">المتجر</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{campaign.storeName}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3">
                <p className="text-xs font-medium text-slate-500">الحالة</p>
                <p className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass}`}
                  >
                    {displayStatus}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div
                className={`rounded-xl border px-4 py-5 text-center ${CAMPAIGN_METRICS.stores.card}`}
              >
                <p className={`text-3xl font-bold tabular-nums ${CAMPAIGN_METRICS.stores.value}`}>
                  {campaign.stores.toLocaleString('ar-LY')}
                </p>
                <p className={`mt-1 text-sm font-medium ${CAMPAIGN_METRICS.stores.label}`}>
                  عدد المتاجر
                </p>
              </div>
              <div
                className={`rounded-xl border px-4 py-5 text-center ${CAMPAIGN_METRICS.products.card}`}
              >
                <p className={`text-3xl font-bold tabular-nums ${CAMPAIGN_METRICS.products.value}`}>
                  {campaign.products.toLocaleString('ar-LY')}
                </p>
                <p className={`mt-1 text-sm font-medium ${CAMPAIGN_METRICS.products.label}`}>
                  عدد المنتجات
                </p>
              </div>
            </div>

            <div
              className={`mt-3 rounded-xl border px-4 py-5 text-center ${CAMPAIGN_METRICS.views.card}`}
            >
              <p className={`text-3xl font-bold tabular-nums ${CAMPAIGN_METRICS.views.value}`}>
                {campaign.views.toLocaleString('ar-LY')}
              </p>
              <p className={`mt-1 text-sm font-medium ${CAMPAIGN_METRICS.views.label}`}>
                المشاهدات
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
