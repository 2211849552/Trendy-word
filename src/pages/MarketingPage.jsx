import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { Plus, TrendingUp, Archive, CircleCheck, CheckCircle, Loader2 } from 'lucide-react'
import {
  getPublicCampaign,
  extractCampaignSubscribedStores,
  mapCampaignSubscriptionStore,
  createAdminCampaign,
  updateAdminCampaign,
  activateCampaign,
  deactivateCampaign,
  fetchAdminCampaignsWithMetrics,
  fetchCampaignWithMetrics,
  mapCampaign,
  toCampaignRequestBody,
  getCampaignActivationHint,
  buildMarketingStats,
  filterCampaignsByUiStatus,
  saveCampaignPrice,
  extractCreatedCampaign,
} from '../api/adminCampaigns.js'
import { StatCard } from '../components/StatCard.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
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
  const [subscribedStores, setSubscribedStores] = useState([])
  const [storesLoading, setStoresLoading] = useState(false)
  const [storesError, setStoresError] = useState('')
  const [editCampaign, setEditCampaign] = useState(null)
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
    const campaigns = await fetchAdminCampaignsWithMetrics({ per_page: 100 })
    if (seq !== loadSeq.current) return
    setList(campaigns)
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

  async function openViewModal(camp) {
    setDetailCampaign(camp)
    setDetailLoading(true)
    setStoresLoading(true)
    setSubscribedStores([])
    setStoresError('')

    const [detailResult, publicResult] = await Promise.allSettled([
      fetchCampaignWithMetrics(camp.id, camp),
      getPublicCampaign(camp.id),
    ])

    if (detailResult.status === 'fulfilled') {
      setDetailCampaign(detailResult.value)
    } else {
      triggerToast(apiErrorMessage(detailResult.reason, 'تعذّر تحميل تفاصيل الحملة.'))
      setDetailCampaign(null)
      setDetailLoading(false)
      setStoresLoading(false)
      return
    }
    setDetailLoading(false)

    if (publicResult.status === 'fulfilled') {
      const stores = extractCampaignSubscribedStores(publicResult.value).map(
        mapCampaignSubscriptionStore,
      )
      setSubscribedStores(stores)
      setDetailCampaign((prev) =>
        prev ? { ...prev, subscribedStores: stores.length } : prev,
      )
    } else {
      setStoresError(apiErrorMessage(publicResult.reason, 'تعذّر تحميل المتاجر المشتركة.'))
    }
    setStoresLoading(false)
  }

  function openEditFromDetail(campaign) {
    if (!campaign) return
    setDetailCampaign(null)
    setSubscribedStores([])
    setStoresError('')
    setEditCampaign(campaign)
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

      let updated = mapCampaign(result?.data ?? result)
      try {
        updated = await fetchCampaignWithMetrics(camp.id, { ...camp, ...updated })
      } catch {
        updated = { ...camp, ...updated, stores: camp.stores, products: camp.products }
      }

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
        subscribedStores={subscribedStores}
        storesLoading={storesLoading}
        storesError={storesError}
        onEdit={openEditFromDetail}
        onClose={() => {
          if (detailLoading) return
          setDetailCampaign(null)
          setSubscribedStores([])
          setStoresError('')
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
                onToggle={handleToggleCampaign}
              />
            ))}
          </div>
        )}
      </div>

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
