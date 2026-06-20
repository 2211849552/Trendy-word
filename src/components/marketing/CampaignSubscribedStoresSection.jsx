import { Loader2, Store, Users } from 'lucide-react'

export function CampaignSubscribedStoresSection({ stores, loading, error }) {
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
        <ul className="space-y-1.5">
          {stores.map((store) => (
            <li
              key={store.id}
              className="rounded-lg border border-white/5 bg-brand-200/80 px-3 py-2"
            >
              <p className="truncate text-xs font-bold text-white">{store.name}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
