export function StatCard({
  label,
  value,
  change,
  trend = 'up',
  icon: Icon,
  iconClassName,
  omitChange = false,
}) {
  const trendColor = trend === 'up' ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
  const arrow = trend === 'up' ? '↑' : '↓'
  const neutral = change === '—'

  return (
    <article
      dir="rtl"
      className="group rounded-2xl bg-white p-6 shadow-sm border border-brand-100/50 transition-all duration-300 hover:shadow-premium hover:-translate-y-1"
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${iconClassName ?? 'bg-brand-50 text-brand-600'}`}
        >
          <Icon className="size-6" strokeWidth={2} aria-hidden />
        </div>
        
        {!omitChange && !neutral && (
          <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${trendColor}`}>
            {change} {arrow}
          </span>
        )}
        {neutral && (
           <span className="text-sm font-semibold text-slate-400">—</span>
        )}
      </div>
      
      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-slate-900 group-hover:text-brand-700 transition-colors">
          {value}
        </p>
      </div>
    </article>
  )
}
