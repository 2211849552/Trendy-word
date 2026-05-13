export function StatCard({ label, value, change, trend = 'up', icon: Icon, iconClassName }) {
  const trendColor = trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
  const arrow = trend === 'up' ? '↑' : '↓'
  const neutral = change === '—'

  return (
    <article
      dir="rtl"
      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100/80"
    >
      <div className="flex items-start justify-between gap-3">
        {neutral ? (
          <span className="text-sm font-semibold text-slate-400">—</span>
        ) : (
          <span className={`text-sm font-semibold tabular-nums ${trendColor}`}>
            {change} {arrow}
          </span>
        )}
        <div
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClassName ?? ''}`}
        >
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
      </p>
    </article>
  )
}
