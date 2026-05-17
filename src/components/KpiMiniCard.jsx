export function KpiMiniCard({ label, value, icon: Icon, iconWrapClassName }) {
  return (
    <article
      dir="rtl"
      className="group rounded-2xl bg-white p-5 shadow-sm border border-brand-100/50 transition-all duration-300 hover:shadow-premium"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconWrapClassName ?? 'bg-brand-50 text-brand-600'}`}
        >
          <Icon className="size-7" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
            {value}
          </p>
        </div>
      </div>
    </article>
  )
}
