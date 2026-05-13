export function KpiMiniCard({ label, value, icon: Icon, iconWrapClassName }) {
  return (
    <article
      dir="rtl"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconWrapClassName ?? 'bg-slate-100 text-slate-600'}`}
        >
          <Icon className="size-6" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </article>
  )
}
