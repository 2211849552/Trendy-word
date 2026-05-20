export function KpiMiniCard({ label, value, icon: Icon, iconWrapClassName }) {
  return (
    <article
      dir="rtl"
      className="group rounded-2xl bg-brand-200 p-5 shadow-premium border border-brand-100/50 transition-all duration-300 hover:shadow-premium"
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex size-14 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 ${iconWrapClassName ?? 'bg-brand-100 text-white'}`}
        >
          <Icon className="size-7" strokeWidth={2} aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/60">{label}</p>
          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-white group-hover:text-white transition-colors">
            {value}
          </p>
        </div>
      </div>
    </article>
  )
}
