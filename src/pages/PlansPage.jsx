import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import {
  CreditCard,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Users,
  CheckCircle,
  X,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PlanFormModal } from '../components/plans/PlanFormModal.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { StatCard } from '../components/StatCard.jsx'
import {
  getAdminPlans,
  getAdminPlan,
  getAdminPlanSubscriptions,
  createAdminPlan,
  updateAdminPlan,
  deleteAdminPlan,
  extractPlanList,
  mergePlansWithSubscriberCounts,
  mergePlansWithFinanceCounts,
  mapPlan,
  mapPlanDetail,
  toPlanPayload,
} from '../api/adminPlans.js'
import { getPlans } from '../api/plans.js'
import { getTotalStores, extractDashboardCount } from '../api/adminDashboard.js'
import { getSubscriptionProfits } from '../api/adminFinance.js'
import { canManagePlans } from '../api/user.js'

import { CHART_BRAND_SCALE } from '../theme/chartColors.js'

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RAD = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52
  const x = cx + radius * Math.cos(-midAngle * RAD)
  const y = cy + radius * Math.sin(-midAngle * RAD)

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px] font-medium"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function PlansDistributionChart({ plans }) {
  const chartData = plans.map((plan, index) => ({
    name: plan.name,
    value: plan.subscribers || 0,
    color: CHART_BRAND_SCALE[index % CHART_BRAND_SCALE.length] || CHART_BRAND_SCALE[0],
  }))

  if (chartData.every((d) => d.value === 0)) {
    return (
      <section className="rounded-2xl bg-brand-200 p-6 shadow-premium ring-1 ring-slate-100/80" dir="rtl">
        <h2 className="text-base font-semibold text-white">توزيع المتاجر حسب الخطط</h2>
        <p className="mt-4 text-sm text-white/60">لا توجد اشتراكات بعد.</p>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-white">توزيع المتاجر حسب الخطط</h2>
      <div className="mt-4 h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              innerRadius={64}
              outerRadius={102}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v}`, 'المتاجر']}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}

function SubscriptionSummaryCard({ plans }) {
  const summary = plans.map((plan, index) => ({
    label: plan.name,
    count: plan.subscribers || 0,
    color: CHART_BRAND_SCALE[index % CHART_BRAND_SCALE.length] || CHART_BRAND_SCALE[0],
  }))

  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-white">ملخص الاشتراكات</h2>
      {summary.length === 0 ? (
        <p className="mt-4 text-sm text-white/60">لا توجد خطط بعد.</p>
      ) : (
        <ul className="mt-4 max-h-[280px] overflow-y-auto space-y-2 pe-2">
          {summary.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-brand-300 px-4 py-3"
            >
              <span className="text-lg font-bold tabular-nums text-white">
                {row.count.toLocaleString('ar-LY')}
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-white/80">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: row.color }} aria-hidden />
                {row.label}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function PlanCard({ plan, onView = () => {}, onDelete = () => {}, canManage = true }) {
  const active = plan.status !== 'paused'
  const periodLabel = `${plan.durationDays ?? 30} يوم`

  return (
    <article
      className="flex flex-col rounded-2xl bg-brand-200 p-6 shadow-premium ring-1 ring-slate-100/80 hover:shadow-premium transition-shadow"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{plan.name}</h3>
        <span
          className={[
            'rounded-full px-3 py-1 text-[11px] font-bold',
            active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
          ].join(' ')}
        >
          {active ? 'نشط' : 'موقوف'}
        </span>
      </div>

      <p className="mt-4">
        <span className="text-3xl font-bold tabular-nums text-white">{plan.price}</span>
        <span className="me-1.5 text-sm font-medium text-white/60">د.ل / {periodLabel}</span>
      </p>

      <p className="mt-3 flex items-center gap-2 text-sm text-white/60">
        <Users className="size-4 shrink-0 text-white/50" strokeWidth={2} aria-hidden />
        <span>{plan.subscribers} اشتراكات للمتاجر</span>
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onView?.(plan)}
          className="btn-action-solid py-2.5"
        >
          <Eye className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          عرض تفاصيل الخطة
        </button>
        {canManage ? (
          <button
            type="button"
            onClick={() => onDelete?.(plan)}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 border border-red-100 py-2.5 text-sm font-bold shadow-premium transition-colors hover:bg-red-100"
          >
            <Trash2 className="size-4" strokeWidth={2} />
            حذف
          </button>
        ) : null}
      </div>
    </article>
  )
}

function apiErrorMessage(err, fallback) {
  if (err?.status === 401) return 'انتهت الجلسة. سجّلي الدخول من جديد.'
  if (err?.status === 422) return err.message || fallback
  if (err?.status === 0 || err?.status == null) return 'تعذّر الاتصال بالخادم.'
  return err?.message || fallback
}

export function PlansPage({ currentUser }) {
  const canManage = canManagePlans(currentUser)
  const [query, setQuery] = useState('')
  const [plans, setPlans] = useState([])
  const [totalSubscribedStores, setTotalSubscribedStores] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', planId: null })
  const [viewPlan, setViewPlan] = useState(null)
  const [viewLoading, setViewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletePlan, setDeletePlan] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const loadSeq = useRef(0)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const loadPlans = useCallback(async (searchQuery = query.trim()) => {
    const seq = ++loadSeq.current
    let list
    let resolvedTotalSubscribers = null

    if (canManage) {
      const params = { per_page: 100 }
      if (searchQuery) params.name = searchQuery
      const data = await getAdminPlans(params)
      if (seq !== loadSeq.current) return
      list = extractPlanList(data).map(mapPlan)
      setTotalSubscribedStores(null)
    } else {
      const [plansResult, subscriptionsResult, totalStoresResult, subscriptionProfitsResult] =
        await Promise.allSettled([
          getPlans({ per_page: 100 }),
          getAdminPlanSubscriptions(),
          getTotalStores(),
          getSubscriptionProfits(),
        ])

      if (seq !== loadSeq.current) return

      if (plansResult.status !== 'fulfilled') {
        throw plansResult.reason
      }

      list = extractPlanList(plansResult.value).map(mapPlan)

      if (subscriptionsResult.status === 'fulfilled') {
        list = mergePlansWithSubscriberCounts(list, subscriptionsResult.value)
      } else if (subscriptionProfitsResult.status === 'fulfilled') {
        list = mergePlansWithFinanceCounts(list, subscriptionProfitsResult.value)
      }

      if (totalStoresResult.status === 'fulfilled') {
        resolvedTotalSubscribers = extractDashboardCount(totalStoresResult.value, [
          'total_stores',
          'stores_count',
          'stores',
          'total',
        ])
      }

      if (resolvedTotalSubscribers == null) {
        resolvedTotalSubscribers = list.reduce((sum, plan) => sum + (plan.subscribers || 0), 0)
      }

      if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase()
        list = list.filter((plan) => plan.name.toLowerCase().includes(normalizedQuery))
      }

      setTotalSubscribedStores(resolvedTotalSubscribers)
    }

    setPlans(list)
  }, [query, canManage])

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true)
      setLoadError('')
      try {
        await loadPlans(query.trim())
      } catch (err) {
        setPlans([])
        setLoadError(apiErrorMessage(err, 'تعذّر تحميل الخطط. تأكد من تسجيل الدخول وأن الخادم يعمل.'))
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, loadPlans])

  const editingPlan = useMemo(
    () => (modal.planId ? plans.find((p) => p.id === modal.planId) : null),
    [modal.planId, plans],
  )

  const modalPlan =
    modal.mode === 'view'
      ? viewPlan
      : viewPlan?.id === modal.planId
        ? viewPlan
        : editingPlan

  const stats = useMemo(() => {
    const totalSubscribers =
      totalSubscribedStores ??
      plans.reduce((sum, p) => sum + (p.subscribers || 0), 0)
    const activePlans = plans.filter((p) => p.status !== 'paused')
    const avgPrice =
      activePlans.length > 0
        ? Math.round(activePlans.reduce((sum, p) => sum + p.price, 0) / activePlans.length)
        : 0
    const estimatedRevenue = plans.reduce((sum, p) => sum + p.price * (p.subscribers || 0), 0)
    return { totalSubscribers, avgPrice, estimatedRevenue }
  }, [plans, totalSubscribedStores])

  function openAddModal() {
    if (!canManage) return
    setViewPlan(null)
    setModal({ open: true, mode: 'add', planId: null })
  }

  function switchToEditFromView(plan) {
    if (!canManage || !plan?.id) return
    setModal({ open: true, mode: 'edit', planId: plan.id })
  }

  async function openViewModal(plan) {
    setViewPlan(null)
    setModal({ open: true, mode: 'view', planId: plan.id })
    if (!canManage) {
      setViewPlan(plan)
      return
    }
    setViewLoading(true)
    try {
      const data = await getAdminPlan(plan.id)
      setViewPlan(mapPlanDetail(data))
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر تحميل تفاصيل الخطة.'))
      setModal((m) => ({ ...m, open: false }))
    } finally {
      setViewLoading(false)
    }
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }))
    setViewPlan(null)
  }

  async function handleSave(payload) {
    if (!canManage) return
    setSaving(true)
    try {
      const body = toPlanPayload(payload)
      if (payload.mode === 'add') {
        await createAdminPlan(body)
        triggerToast('تم إنشاء الخطة بنجاح')
      } else if (payload.mode === 'edit' && payload.id) {
        await updateAdminPlan(payload.id, body)
        triggerToast('تم تحديث الخطة بنجاح')
      }
      await loadPlans(query.trim())
      closeModal()
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر حفظ الخطة. حاول مرة أخرى.'))
    } finally {
      setSaving(false)
    }
  }

  function handleDeletePlan(plan) {
    if (!canManage) return
    setDeletePlan(plan)
  }

  async function confirmDelete() {
    if (!deletePlan) return
    const idToDelete = Number(deletePlan.id)
    if (!Number.isFinite(idToDelete)) {
      triggerToast('معرّف الخطة غير صالح.')
      return
    }

    setDeleting(true)
    try {
      const result = await deleteAdminPlan(idToDelete)
      loadSeq.current += 1
      setPlans((prev) => prev.filter((p) => Number(p.id) !== idToDelete))
      setDeletePlan(null)
      triggerToast(result?.message || 'تم حذف الخطة بنجاح')
      await loadPlans(query.trim())
    } catch (err) {
      triggerToast(apiErrorMessage(err, 'تعذّر حذف الخطة. حاول مرة أخرى.'))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">{toastMessage}</span>
          </div>
        </div>
      )}

      {deletePlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => !deleting && setDeletePlan(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-brand-200 shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-white/5 bg-brand-300/50 px-5 py-4">
              <h2 className="text-lg font-bold text-white">تأكيد حذف الخطة</h2>
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletePlan(null)}
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
                أنت على وشك حذف خطة <span className="font-bold text-white">«{deletePlan.name}»</span> نهائياً. سيؤثر هذا على المشتركين الحاليين.
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
                onClick={() => setDeletePlan(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/10 bg-brand-200 px-4 text-sm font-bold text-white/80 shadow-premium hover:bg-brand-300 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <PlanFormModal
        open={modal.open && !(modal.mode === 'view' && viewLoading)}
        mode={modal.mode}
        initialPlan={modalPlan}
        onClose={closeModal}
        onSave={handleSave}
        onEdit={switchToEditFromView}
        saving={saving}
        loadSubscriptions={canManage}
        canManage={canManage}
      />

      {modal.open && modal.mode === 'view' && viewLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
          <div className="flex items-center gap-3 rounded-2xl bg-brand-200 px-6 py-4 text-white shadow-2xl">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm font-bold">جاري تحميل تفاصيل الخطة...</span>
          </div>
        </div>
      )}

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">إدارة الخطط</h1>
          <p className="mt-1 text-white/60">إدارة خطط الاشتراك وتسعير المنصة</p>
        </div>
        {canManage ? (
          <PrimaryButton
            onClick={openAddModal}
            disabled={saving}
            className="shrink-0 self-start disabled:opacity-60"
          >
            <Plus className="size-5" strokeWidth={2.25} aria-hidden />
            إضافة خطة اشتراك
          </PrimaryButton>
        ) : null}
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
        <StatCard
          label="اجمالي الاشتراكات"
          value={stats.totalSubscribers.toLocaleString('ar-LY')}
          change="—"
          trend="up"
          icon={Users}
          iconClassName="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="إجمالي الخطط"
          value={String(plans.length)}
          change="—"
          trend="up"
          icon={CreditCard}
          iconClassName="bg-brand-300 text-white/90"
        />
      </div>

      <div className={`mt-8 grid gap-6 ${canManage ? 'lg:grid-cols-2' : ''}`}>
        <SubscriptionSummaryCard plans={plans} />
        {canManage ? <PlansDistributionChart plans={plans} /> : null}
      </div>

      <div className="relative mt-8" dir="rtl">
        <Search
          className="pointer-events-none absolute top-1/2 end-4 size-5 -translate-y-1/2 text-white/50"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="البحث عن خطة اشتراك..."
          className="w-full rounded-xl border border-white/10 bg-brand-200 py-3 pe-12 ps-4 text-sm text-white shadow-premium outline-none ring-slate-200/80 transition placeholder:text-white/50 focus:border-brand-900 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {loadError ? (
        <p className="mt-6 text-center text-sm text-rose-400">{loadError}</p>
      ) : null}

      {loading ? (
        <div className="mt-12 flex items-center justify-center gap-3 text-white/70">
          <Loader2 className="size-6 animate-spin" />
          <span className="text-sm font-medium">جاري تحميل الخطط...</span>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onView={openViewModal}
                onDelete={handleDeletePlan}
                canManage={canManage}
              />
            ))}
          </div>

          {!loadError && plans.length === 0 ? (
            <p className="mt-6 text-center text-sm text-white/60">
              {query.trim() ? 'لا توجد خطط مطابقة للبحث.' : 'لا توجد خطط اشتراك بعد. أضيفي خطة جديدة.'}
            </p>
          ) : null}
        </>
      )}
    </>
  )
}
