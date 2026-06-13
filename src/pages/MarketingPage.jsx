import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { Plus, TrendingUp, Archive, CircleCheck, CheckCircle, Trash2, X, Loader2 } from 'lucide-react'
import {
  getAdminCampaigns,
  getAdminCampaign,
  createAdminCampaign,
  updateAdminCampaign,
  deleteAdminCampaign,
  activateCampaign,
  deactivateCampaign,
  extractCampaignList,
  mapCampaign,
  mapCampaignDetail,
  toCampaignRequestBody,
  getCampaignActivationHint,
  buildPerformanceSeries,
  buildMarketingStats,
  filterCampaignsByUiStatus,
  saveCampaignPrice,
  removeCampaignPrice,
  extractCreatedCampaign,
} from '../api/adminCampaigns.js'
import { StatCard } from '../components/StatCard.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { CampaignPerformanceChart } from '../components/marketing/CampaignPerformanceChart.jsx'
import { CampaignCard } from '../components/marketing/CampaignCard.jsx'
import { CreateCampaignModal } from '../components/marketing/CreateCampaignModal.jsx'
import { CampaignDetailModal } from '../components/marketing/CampaignDetailModal.jsx'
import { EditCampaignModal } from '../components/marketing/EditCampaignModal.jsx'
import { statusLabels } from '../data/campaigns.js'

const FILTER_KEYS = ['all', 'active', 'scheduled', 'finished', 'stopped']

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 403) return 'ليس لديك صلاحية إدارة الحملات.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function MarketingPage() {
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [detailCampaign, setDetailCampaign] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [editCampaign, setEditCampaign] = useState(null)
  const [deleteCampaign, setDeleteCampaign] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const loadSeq = useRef(0)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const loadCampaigns = useCallback(async () => {
    const seq = ++loadSeq.current
    const data = await getAdminCampaigns({ per_page: 100 })
    if (seq !== loadSeq.current) return
    setList(extractCampaignList(data).map(mapCampaign))
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadCampaigns()
      } catch (err) {
        if (cancelled) return
        setList([])
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل الحملات. تأكد من تسجيل الدخول وأن الخادم يعمل.'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadCampaigns])

  const filtered = useMemo(
    () => filterCampaignsByUiStatus(list, filter),
    [list, filter],
  )

  const stats = useMemo(() => buildMarketingStats(list), [list])
  const performanceData = useMemo(() => buildPerformanceSeries(list), [list])

  async function openViewModal(camp) {
    setDetailCampaign(camp)
    setDetailLoading(true)
    try {
      const data = await getAdminCampaign(camp.id)
      setDetailCampaign(mapCampaignDetail(data))
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الحملة.'))
      setDetailCampaign(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function handleCreate(form) {
    setSaving(true)
    try {
      const res = await createAdminCampaign(toCampaignRequestBody(form))
      const created = extractCreatedCampaign(res)
      if (created?.id != null && form.price !== '') {
        saveCampaignPrice(created.id, form.price)
      }
      triggerToast('تم إنشاء الحملة بنجاح')
      setCreateOpen(false)
      await loadCampaigns()
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر إنشاء الحملة. حاول مرة أخرى.'))
    } finally {
      setSaving(false)
    }
  }

  async function handleEditSave(form) {
    setSaving(true)
    try {
      await updateAdminCampaign(form.id, toCampaignRequestBody(form))
      if (form.id != null && form.price != null && form.price !== '') {
        saveCampaignPrice(form.id, form.price)
      }
      triggerToast('تم تحديث الحملة بنجاح')
      setEditCampaign(null)
      await loadCampaigns()
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحديث الحملة. حاول مرة أخرى.'))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteCampaign) return
    const idToDelete = Number(deleteCampaign.id)
    if (!Number.isFinite(idToDelete)) {
      triggerToast('معرّف الحملة غير صالح.')
      return
    }

    setDeleting(true)
    try {
      const result = await deleteAdminCampaign(idToDelete)
      removeCampaignPrice(idToDelete)
      loadSeq.current += 1
      setList((prev) => prev.filter((c) => Number(c.id) !== idToDelete))
      setDeleteCampaign(null)
      triggerToast(result?.message || 'تم حذف الحملة بنجاح')
      await loadCampaigns()
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر حذف الحملة. حاول مرة أخرى.'))
    } finally {
      setDeleting(false)
    }
  }

  async function handleToggleCampaign(camp) {
    const isActive = camp.status === 'active' && !camp.paused

    if (!isActive) {
      const hint = getCampaignActivationHint(camp)
      if (hint) {
        triggerToast(hint)
        return
      }
    }

    try {
      const result = isActive
        ? await deactivateCampaign(camp.id)
        : await activateCampaign(camp.id)

      const updated = mapCampaign(result?.data ?? result)
      setList((prev) => prev.map((x) => (x.id === camp.id ? updated : x)))
      triggerToast(isActive ? 'تم إيقاف الحملة الإعلانية' : 'تم تفعيل الحملة الإعلانية')
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحديث حالة الحملة. حاول مرة أخرى.'))
    }
  }

  return (
    <>
      <CampaignDetailModal
        campaign={detailLoading ? null : detailCampaign}
        open={Boolean(detailCampaign) || detailLoading}
        onClose={() => {
          if (detailLoading) return
          setDetailCampaign(null)
        }}
      />

      {detailLoading && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="flex items-center gap-3 rounded-2xl bg-brand-200 px-6 py-4 text-white shadow-2xl">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm font-bold">جاري تحميل تفاصيل الحملة...</span>
          </div>
        </div>
      )}

      <EditCampaignModal
        campaign={editCampaign}
        open={Boolean(editCampaign)}
        onClose={() => !saving && setEditCampaign(null)}
        onSave={handleEditSave}
        saving={saving}
      />

      <CreateCampaignModal
        open={createOpen}
        onClose={() => !saving && setCreateOpen(false)}
        onSubmit={handleCreate}
        saving={saving}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between" dir="rtl">
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            التسويق والمحتوى
          </h1>
          <p className="mt-1 text-white/60">إدارة الحملات الإعلانية والمحتوى الترويجي</p>
        </header>
        <PrimaryButton
          onClick={() => setCreateOpen(true)}
          disabled={saving}
          className="shrink-0"
        >
          <Plus className="size-5" strokeWidth={2.5} aria-hidden />
          إنشاء حملة إعلانية
        </PrimaryButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" dir="ltr">
        <StatCard
          label="الحملات المنتهية"
          value={String(stats.expired)}
          change="—"
          trend="up"
          icon={Archive}
          iconClassName="bg-brand-300 text-white/70"
        />
        <StatCard
          label="الحملات المجدولة"
          value={String(stats.scheduled)}
          change="—"
          trend="up"
          icon={CircleCheck}
          iconClassName="bg-brand-300 text-white/90"
        />
        <StatCard
          label="الحملات النشطة"
          value={String(stats.active)}
          change={stats.activeChange}
          trend="up"
          icon={TrendingUp}
          iconClassName="bg-brand-300 text-white"
        />
      </div>

      <div className="mt-8">
        <CampaignPerformanceChart data={performanceData} />
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

        {loadError ? (
          <p className="mb-4 text-center text-sm text-rose-400">{loadError}</p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl bg-brand-200 py-12 text-white/70 shadow-premium ring-1 ring-slate-100/80">
            <Loader2 className="size-6 animate-spin" />
            <span className="text-sm font-medium">جاري تحميل الحملات...</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-2xl bg-brand-200 py-12 text-center text-sm text-white/60 shadow-premium ring-1 ring-slate-100/80">
            {filter === 'all' ? 'لا توجد حملات بعد. أنشئي حملة جديدة.' : 'لا توجد حملات في هذا التصنيف.'}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onView={openViewModal}
                onEdit={(camp) => setEditCampaign(camp)}
                onToggle={handleToggleCampaign}
                onDelete={(camp) => setDeleteCampaign(camp)}
              />
            ))}
          </div>
        )}
      </div>

      {deleteCampaign && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteCampaign(null)}
          />
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200"
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
              <h2 className="text-lg font-bold text-white">تأكيد حذف الحملة</h2>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteCampaign(null)}
                className="rounded-lg p-1.5 text-white/50 hover:bg-brand-300 hover:text-white/70 transition-colors disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-white">هل أنت متأكد؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                أنت على وشك حذف الحملة{' '}
                <span className="font-bold text-white">«{deleteCampaign.title}»</span> نهائياً.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-brand-300 border-t border-white/5 sm:flex-row-reverse sm:gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-premium hover:bg-rose-700 transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : null}
                تأكيد الحذف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteCampaign(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-4 text-sm font-bold text-white/80 shadow-premium hover:bg-brand-300 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

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
