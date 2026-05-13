import { useMemo, useState } from 'react'
import { Plus, Eye, TrendingUp, Archive, CircleCheck } from 'lucide-react'
import { StatCard } from '../components/StatCard.jsx'
import { CampaignPerformanceChart } from '../components/marketing/CampaignPerformanceChart.jsx'
import { CampaignCard } from '../components/marketing/CampaignCard.jsx'
import { CreateCampaignModal } from '../components/marketing/CreateCampaignModal.jsx'
import { CampaignDetailModal } from '../components/marketing/CampaignDetailModal.jsx'
import { EditCampaignModal } from '../components/marketing/EditCampaignModal.jsx'
import {
  campaigns as seedCampaigns,
  marketingStats,
  statusLabels,
} from '../data/campaigns.js'

const FILTER_KEYS = ['all', 'active', 'scheduled', 'finished', 'stopped']

export function MarketingPage() {
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [list, setList] = useState(() => seedCampaigns.map((c) => ({ ...c })))
  const [detailCampaign, setDetailCampaign] = useState(null)
  const [editCampaign, setEditCampaign] = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return list
    return list.filter((c) => c.status === filter)
  }, [list, filter])

  return (
    <>
      <CampaignDetailModal
        campaign={detailCampaign}
        open={Boolean(detailCampaign)}
        onClose={() => setDetailCampaign(null)}
      />

      <EditCampaignModal
        campaign={editCampaign}
        open={Boolean(editCampaign)}
        onClose={() => setEditCampaign(null)}
        onSave={({ id, title, description, storeName, dateFrom, dateTo }) => {
          setList((prev) =>
            prev.map((x) =>
              x.id === id ? { ...x, title, description, storeName, dateFrom, dateTo } : x,
            ),
          )
        }}
      />

      <CreateCampaignModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={(form) => {
          setList((prev) => [
            ...prev,
            {
              id: `c-${Date.now()}`,
              title: form.name,
              description: form.description,
              storeName: form.storeName,
              status: 'scheduled',
              stores: 0,
              products: 0,
              views: 0,
              dateFrom: form.dateFrom,
              dateTo: form.dateTo,
              emoji: '📣',
              paused: false,
            },
          ])
          window.alert('تم حفظ الحملة الجديدة (واجهة تجريبية).')
        }}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" dir="rtl">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            التسويق والمحتوى
          </h1>
          <p className="mt-1 text-slate-500">
            إدارة الحملات الإعلانية والمحتوى الترويجي
          </p>
        </header>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-sky-700"
        >
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إنشاء حملة إعلانية
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المشاهدات"
          value={marketingStats.totalViews}
          change={marketingStats.viewsChange}
          trend="up"
          icon={Eye}
          iconClassName="bg-sky-100 text-sky-600"
        />
        <StatCard
          label="الحملات المنتهية"
          value={String(marketingStats.expired)}
          change="—"
          trend="up"
          icon={Archive}
          iconClassName="bg-slate-100 text-slate-600"
        />
        <StatCard
          label="الحملات المجدولة"
          value={String(marketingStats.scheduled)}
          change="—"
          trend="up"
          icon={CircleCheck}
          iconClassName="bg-amber-100 text-amber-600"
        />
        <StatCard
          label="الحملات النشطة"
          value={String(marketingStats.active)}
          change={marketingStats.activeChange}
          trend="up"
          icon={TrendingUp}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
      </div>

      <div className="mt-8">
        <CampaignPerformanceChart />
      </div>

      <div className="mt-8" dir="rtl">
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                filter === key
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50',
              ].join(' ')}
            >
              {statusLabels[key]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-white py-12 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100/80">
            لا توجد حملات في هذا التصنيف.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onView={(camp) => setDetailCampaign(camp)}
                onEdit={(camp) => setEditCampaign(camp)}
                onToggle={(camp) =>
                  setList((prev) =>
                    prev.map((x) =>
                      x.id === camp.id ? { ...x, paused: !x.paused } : x,
                    ),
                  )
                }
                onDelete={(camp) => {
                  if (
                    window.confirm(`هل تريد حذف الحملة «${camp.title}»؟`)
                  ) {
                    setList((prev) => prev.filter((x) => x.id !== camp.id))
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
