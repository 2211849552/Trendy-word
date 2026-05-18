import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** ترتيب المحور من اليسار لليمين ليطابق العرض: قيد التنفيذ … قيد الشحن */
const data = [
  { name: 'قيد التنفيذ', count: 220 },
  { name: 'تم التسليم', count: 920 },
  { name: 'ملغي', count: 28 },
  { name: 'قيد الشحن', count: 240 },
]

export function OrderStatusBarCard() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">حالة الطلبات</h2>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="size-2 rounded-full bg-brand-500 animate-pulse" />
          تحديث مباشر
        </div>
      </div>
      
      <div className="h-[280px] w-full" dir="ltr">
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
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
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
                padding: '12px'
              }}
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
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-6 flex justify-center gap-6 border-t border-slate-50 pt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <span className="size-3 shrink-0 rounded-full bg-brand-500" aria-hidden />
          عدد الطلبات
        </div>
      </div>
    </section>
  )
}
