import { useMemo, useState } from 'react'
import { Plus, Eye, TrendingUp, Archive, CircleCheck, CheckCircle, Trash2, X } from 'lucide-react'
import { activateCampaign, deactivateCampaign } from '../api/adminCampaigns.js'
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
  const [deleteCampaign, setDeleteCampaign] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const filtered = useMemo(() => {
    if (filter === 'all') return list
    return list.filter((c) => c.status === filter)
  }, [list, filter])

  const confirmDelete = () => {
    if (!deleteCampaign) return
    setList(prev => prev.filter(c => c.id !== deleteCampaign.id))
    setDeleteCampaign(null)
    setToastMessage('تم حذف الحملة بنجاح')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleToggleCampaign = async (camp) => {
    const isActive = !camp.paused && camp.status !== 'stopped'

    try {
      if (isActive) {
        await deactivateCampaign(camp.id)
      } else {
        await activateCampaign(camp.id)
      }
    } catch {
      setToastMessage('تعذّر تحديث حالة الحملة. حاول مرة أخرى.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setList((prev) =>
      prev.map((x) => {
        if (x.id !== camp.id) return x

        const newPaused = isActive
        const message = newPaused ? 'تم إيقاف الحملة الإعلانية' : 'تم تفعيل الحملة الإعلانية'
        setToastMessage(message)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)

        let newStatus = x.status
        if (newPaused) {
          newStatus = 'stopped'
        } else if (x.status === 'stopped') {
          newStatus = 'active'
        }

        return { ...x, paused: newPaused, status: newStatus }
      }),
    )
  }

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
              paused: false,
            },
          ])
          setToastMessage('تم إنشاء الحملة بنجاح')
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" dir="rtl">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            التسويق والمحتوى
          </h1>
          <p className="mt-1 text-white/60">
            إدارة الحملات الإعلانية والمحتوى الترويجي
          </p>
        </header>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="btn-primary shrink-0"
        >
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إنشاء حملة إعلانية
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="ltr">
        <StatCard
          label="إجمالي المشاهدات"
          value={marketingStats.totalViews}
          change={marketingStats.viewsChange}
          trend="up"
          icon={Eye}
          iconClassName="bg-brand-300 text-white"
        />
        <StatCard
          label="الحملات المنتهية"
          value={String(marketingStats.expired)}
          change="—"
          trend="up"
          icon={Archive}
          iconClassName="bg-brand-300 text-white/70"
        />
        <StatCard
          label="الحملات المجدولة"
          value={String(marketingStats.scheduled)}
          change="—"
          trend="up"
          icon={CircleCheck}
          iconClassName="bg-brand-300 text-white/90"
        />
        <StatCard
          label="الحملات النشطة"
          value={String(marketingStats.active)}
          change={marketingStats.activeChange}
          trend="up"
          icon={TrendingUp}
          iconClassName="bg-brand-300 text-white"
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
                  ? 'bg-brand-900 text-white shadow-premium'
                  : 'bg-brand-200 text-white/70 ring-1 ring-slate-200 hover:bg-brand-300',
              ].join(' ')}
            >
              {statusLabels[key]}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-2xl bg-brand-200 py-12 text-center text-sm text-white/60 shadow-premium ring-1 ring-slate-100/80">
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
                onToggle={handleToggleCampaign}
                onDelete={(camp) => setDeleteCampaign(camp)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCampaign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteCampaign(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
              <h2 className="text-lg font-bold text-white">تأكيد حذف الحملة</h2>
              <button onClick={() => setDeleteCampaign(null)} className="rounded-lg p-1.5 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-white">هل أنت متأكد؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                أنت على وشك حذف الحملة <span className="font-bold text-white">«{deleteCampaign.title}»</span> نهائياً.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-brand-300 border-t border-white/5 sm:flex-row-reverse sm:gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-premium hover:bg-rose-700 transition-colors"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setDeleteCampaign(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-4 text-sm font-bold text-white/80 shadow-premium hover:bg-brand-300 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  )
}
