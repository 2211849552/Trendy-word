import { useMemo, useState } from 'react'
import {
  CreditCard,
  DollarSign,
  Pencil,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Users,
  CheckCircle,
  X,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { PlanFormModal } from '../components/plans/PlanFormModal.jsx'
import { StatCard } from '../components/StatCard.jsx'

import { CHART_BRAND_SCALE } from '../theme/chartColors.js'

const planDistribution = [
  { name: 'الخطة الأساسية', value: 49, color: CHART_BRAND_SCALE[0] },
  { name: 'الخطة المتقدمة', value: 35, color: CHART_BRAND_SCALE[2] },
  { name: 'الخطة الاحترافية', value: 16, color: CHART_BRAND_SCALE[3] },
]

const subscriptionSummary = [
  { label: 'الخطة الأساسية', count: 120, dotClass: 'bg-brand-950' },
  { label: 'الخطة المتقدمة', count: 85, dotClass: 'bg-brand-600' },
  { label: 'الخطة الاحترافية', count: 40, dotClass: 'bg-brand-400' },
]

const initialPlans = [
  {
    id: 'basic',
    name: 'الخطة الأساسية',
    price: 50,
    subscribers: 120,
    duration: 'monthly',
    status: 'active',
    features: ['حتى 100 منتج', 'لوحة تحكم أساسية', 'دعم فني عبر البريد'],
  },
  {
    id: 'advanced',
    name: 'الخطة المتقدمة',
    price: 120,
    subscribers: 85,
    duration: 'monthly',
    status: 'active',
    features: ['منتجات غير محدودة', 'تقارير متقدمة', 'دعم أولوية'],
  },
  {
    id: 'pro',
    name: 'الخطة الاحترافية',
    price: 250,
    subscribers: 40,
    duration: 'monthly',
    status: 'active',
    features: ['كل ميزات المتقدمة', 'API مخصص', 'مدير حساب'],
  },
]

function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  const RAD = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52
  const x = cx + radius * Math.cos(-midAngle * RAD)
  const y = cy + radius * Math.sin(-midAngle * RAD)

  return (
    <text
      x={x}
      y={y}
      fill="#334155"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px] font-medium"
    >
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function PlansDistributionChart() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">توزيع المتاجر حسب الخطط</h2>
      <div className="mt-4 h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={planDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              innerRadius={64}
              outerRadius={102}
              paddingAngle={2}
              dataKey="value"
            >
              {planDistribution.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => [`${v}%`, 'النسبة']}
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

function SubscriptionSummaryCard() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">ملخص الاشتراكات</h2>
      <ul className="mt-4 space-y-2">
        {subscriptionSummary.map((row) => (
          <li
            key={row.label}
            className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3"
          >
            <span className="text-lg font-bold tabular-nums text-slate-900">{row.count}</span>
            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className={`size-2.5 shrink-0 rounded-full ${row.dotClass}`} aria-hidden />
              {row.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function PlanCard({ plan, onEdit = () => {}, onDelete = () => {}, onToggleStatus = () => {} }) {
  const active = plan.status !== 'paused'
  const periodLabel = plan.duration === 'yearly' ? 'سنوي' : 'شهري'

  return (
    <article
      className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80 hover:shadow-md transition-shadow"
      dir="rtl"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
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
        <span className="text-3xl font-bold tabular-nums text-slate-900">{plan.price}</span>
        <span className="me-1.5 text-sm font-medium text-slate-500">د.ل / {periodLabel}</span>
      </p>

      <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
        <Users className="size-4 shrink-0 text-slate-400" strokeWidth={2} aria-hidden />
        <span>
          {plan.subscribers} متجر مشترك
        </span>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onEdit?.(plan)}
          className="btn-action-solid col-span-2 py-2.5"
        >
          <Pencil className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          تعديل
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(plan)}
          className="col-span-2 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-red-600 border border-red-100 py-2.5 text-sm font-bold shadow-sm transition-colors hover:bg-red-100"
        >
          <Trash2 className="size-4" strokeWidth={2} />
          حذف
        </button>
      </div>
    </article>
  )
}

export function PlansPage() {
  const [query, setQuery] = useState('')
  const [plans, setPlans] = useState(initialPlans)
  const [modal, setModal] = useState({ open: false, mode: 'add', planId: null })

  const editingPlan = useMemo(
    () => (modal.planId ? plans.find((p) => p.id === modal.planId) : null),
    [modal.planId, plans],
  )

  function openAddModal() {
    setModal({ open: true, mode: 'add', planId: null })
  }

  function openEditModal(plan) {
    setModal({ open: true, mode: 'edit', planId: plan.id })
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }))
  }

  function handleSave(payload) {
    if (payload.mode === 'add') {
      setPlans((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: payload.name,
          price: payload.price,
          subscribers: 0,
          duration: payload.duration,
          status: payload.status,
          features: payload.features,
        },
      ])
      return
    }
    if (payload.mode === 'edit' && payload.id) {
      setPlans((prev) =>
        prev.map((p) =>
          p.id === payload.id
            ? {
                ...p,
                name: payload.name,
                price: payload.price,
                duration: payload.duration,
                status: payload.status,
                features: payload.features,
              }
            : p,
        ),
      )
    }
  }

  const [deletePlan, setDeletePlan] = useState(null)
  const [showToast, setShowToast] = useState(false)

  function handleDeletePlan(plan) {
    setDeletePlan(plan)
  }

  function confirmDelete() {
    if (!deletePlan) return
    setPlans(prev => prev.filter(p => p.id !== deletePlan.id))
    setDeletePlan(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  function handleToggleStatus(id, newStatus) {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
  }

  const filteredPlans = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return plans
    return plans.filter((p) => p.name.toLowerCase().includes(q))
  }, [query, plans])

  return (
    <>
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-5 duration-300">
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle className="size-5" />
            <span className="font-bold">تم حذف الخطة بنجاح</span>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletePlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeletePlan(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in zoom-in-95 duration-200" dir="rtl">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <h2 className="text-lg font-bold text-slate-900">تأكيد حذف الخطة</h2>
              <button onClick={() => setDeletePlan(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="size-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <Trash2 className="size-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">هل أنت متأكد؟</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                أنت على وشك حذف خطة <span className="font-bold text-slate-900">«{deletePlan.name}»</span> نهائياً. سيؤثر هذا على المشتركين الحاليين.
              </p>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-slate-50 border-t border-slate-100 sm:flex-row-reverse sm:gap-3">
              <button
                type="button"
                onClick={confirmDelete}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-rose-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-rose-700 transition-colors"
              >
                تأكيد الحذف
              </button>
              <button
                type="button"
                onClick={() => setDeletePlan(null)}
                className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <PlanFormModal
        open={modal.open}
        mode={modal.mode}
        initialPlan={editingPlan}
        onClose={closeModal}
        onSave={handleSave}
      />

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 lg:text-3xl">
            إدارة الخطط
          </h1>
          <p className="mt-1 text-slate-500">إدارة خطط الاشتراك وتسعير المنصة</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-950"
        >
          <Plus className="size-5" strokeWidth={2.25} aria-hidden />
          إضافة خطة اشتراك
        </button>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" dir="ltr">
        <StatCard
          label="متوسط قيمة الاشتراك"
          value="107"
          change="—"
          trend="up"
          icon={TrendingUp}
          iconClassName="bg-violet-100 text-violet-600"
        />
        <StatCard
          label="إيرادات الاشتراكات"
          value="26200"
          change="15%"
          trend="up"
          icon={DollarSign}
          iconClassName="bg-violet-100 text-violet-600"
        />
        <StatCard
          label="المتاجر المشتركة"
          value="245"
          change="8%"
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
          iconClassName="bg-brand-100 text-brand-800"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <SubscriptionSummaryCard />
        <PlansDistributionChart />
      </div>

      <div className="relative mt-8" dir="rtl">
        <Search
          className="pointer-events-none absolute top-1/2 end-4 size-5 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="البحث عن خطة اشتراك..."
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pe-12 ps-4 text-sm text-slate-900 shadow-sm outline-none ring-slate-200/80 transition placeholder:text-slate-400 focus:border-brand-900 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onEdit={openEditModal}
            onDelete={handleDeletePlan}
            onToggleStatus={handleToggleStatus}
          />
        ))}
      </div>

      {filteredPlans.length === 0 ? (
        <p className="mt-6 text-center text-sm text-slate-500">لا توجد خطط مطابقة للبحث.</p>
      ) : null}
    </>
  )
}
