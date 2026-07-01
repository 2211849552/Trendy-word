import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const DEFAULT_DATA = [
  { name: 'قيد التنفيذ', count: 0 },
  { name: 'تم التسليم', count: 0 },
  { name: 'ملغي', count: 0 },
  { name: 'قيد الشحن', count: 0 },
]

export function OrderStatusBarCard({ stats = null }) {
  const data = stats
    ? [
        { name: 'قيد التنفيذ', count: stats.newOrders ?? 0 },
        { name: 'تم التسليم', count: stats.delivered ?? 0 },
        { name: 'ملغي', count: stats.cancelled ?? 0 },
        { name: 'قيد الشحن', count: stats.shipping ?? 0 },
      ]
    : DEFAULT_DATA

  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const yMax = Math.ceil(maxCount / 100) * 100 || 1000

  return (
    <section className="rounded-2xl bg-brand-200 p-6 shadow-premium border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">حالة الطلبات</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-white/50 uppercase tracking-wider">
          <div className="size-2 rounded-full bg-brand-500 animate-pulse" />
          تحديث مباشر
        </div>
      </div>

      <div className="h-[280px] w-full" dir="ltr">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
                axisLine={{ stroke: '#f1f5f9' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                contentStyle={{
                  borderRadius: 16,
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  fontFamily: 'Cairo, sans-serif',
                  padding: '12px',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                }}
                itemStyle={{ color: '#000000' }}
                labelStyle={{ color: '#000000', fontWeight: 'bold' }}
                formatter={(v) => [v, 'عدد الطلبات']}
              />
              <Bar
                dataKey="count"
                name="عدد الطلبات"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b83c7" />
                  <stop offset="100%" stopColor="#5c54a4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/50">
            لا توجد بيانات كافية
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center gap-6 border-t border-brand-400/30 pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/70">
          <span className="size-3 shrink-0 rounded-full bg-brand-500" aria-hidden />
          عدد الطلبات
        </div>
      </div>
    </section>
  )
}
