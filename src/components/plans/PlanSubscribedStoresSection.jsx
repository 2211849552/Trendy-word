import { Loader2, Store, Users } from 'lucide-react'
import { formatPlanSubscriptionDate } from '../../api/adminPlans.js'

const SUBSCRIPTION_STATUS_CLASS = {
  active: 'bg-emerald-500/20 text-emerald-400 ring-emerald-500/30',
  scheduled: 'bg-sky-500/20 text-sky-400 ring-sky-500/30',
  expired: 'bg-slate-500/20 text-slate-300 ring-slate-500/30',
  cancelled: 'bg-rose-500/20 text-rose-400 ring-rose-500/30',
  inactive: 'bg-yellow-500/20 text-yellow-400 ring-yellow-500/30',
}

function StatusBadge({ label, statusKey }) {
  const className =
    SUBSCRIPTION_STATUS_CLASS[statusKey] ?? 'bg-white/10 text-white/70 ring-white/10'
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${className}`}>
      {label}
    </span>
  )
}

export function PlanSubscribedStoresSection({ stores, loading, error }) {
  return (
    <section className="rounded-xl border border-white/10 bg-brand-300/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <Users className="size-3.5 shrink-0 text-white/60" strokeWidth={2.25} />
          <h3 className="truncate text-xs font-bold text-white">المتاجر المشتركة</h3>
        </div>
        {!loading && !error ? (
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-bold tabular-nums text-white/80">
            {stores.length.toLocaleString('ar-LY')}
          </span>
        ) : null}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-white/60">
          <Loader2 className="size-3.5 animate-spin" />
          <span>جاري التحميل...</span>
        </div>
      ) : null}

      {!loading && error ? (
        <p className="rounded-lg bg-rose-500/10 px-2.5 py-2 text-xs text-rose-300">{error}</p>
      ) : null}

      {!loading && !error && stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1.5 py-6 text-center">
          <Store className="size-6 text-white/30" strokeWidth={1.75} />
          <p className="text-xs text-white/50">لا توجد متاجر مشتركة.</p>
        </div>
      ) : null}

      {!loading && !error && stores.length > 0 ? (
        <ul className="space-y-2">
          {stores.map((store) => (
            <li
              key={store.id}
              className="rounded-lg border border-white/5 bg-brand-200/80 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">{store.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/50">{store.statusLabel}</p>
                </div>
                <StatusBadge
                  label={store.subscription.statusLabel}
                  statusKey={store.subscription.status}
                />
              </div>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                <div>
                  <p className="text-white/45">البدء</p>
                  <p className="font-semibold tabular-nums text-white/85" dir="ltr">
                    {formatPlanSubscriptionDate(store.subscription.startsAt)}
                  </p>
                </div>
                <div>
                  <p className="text-white/45">الانتهاء</p>
                  <p className="font-semibold tabular-nums text-white/85" dir="ltr">
                    {formatPlanSubscriptionDate(store.subscription.endsAt)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-white/45">المبلغ المدفوع</p>
                  <p className="font-semibold tabular-nums text-white/85">
                    {store.subscription.pricePaid != null
                      ? `${store.subscription.pricePaid.toLocaleString('ar-LY')} د.ل`
                      : '—'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
