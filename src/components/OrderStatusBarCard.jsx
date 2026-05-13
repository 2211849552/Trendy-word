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
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">حالة الطلبات</h2>
      <div className="mt-4 h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 1000]}
              ticks={[0, 250, 500, 750, 1000]}
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(v) => [v, 'عدد الطلبات']}
            />
            <Bar
              dataKey="count"
              name="عدد الطلبات"
              fill="#2563eb"
              radius={[8, 8, 0, 0]}
              maxBarSize={56}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="size-3 shrink-0 rounded-sm bg-[#2563eb]" aria-hidden />
          عدد الطلبات
        </div>
      </div>
    </section>
  )
}
