import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const monthly = [
  { month: 'يناير', revenue: 42000, orders: 820 },
  { month: 'فبراير', revenue: 48000, orders: 910 },
  { month: 'مارس', revenue: 52000, orders: 980 },
  { month: 'إبريل', revenue: 61000, orders: 1050 },
  { month: 'مايو', revenue: 58000, orders: 1090 },
  { month: 'يونيو', revenue: 67000, orders: 1127 },
]

export function LineChartCard() {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100/80" dir="rtl">
      <h2 className="text-base font-semibold text-slate-900">الإيرادات والطلبات الشهرية</h2>
      <div className="mt-4 h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 80000]}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 1500]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                fontFamily: 'Cairo, sans-serif',
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `${Number(value).toLocaleString('ar-LY')} د.ل` : value,
                name === 'revenue' ? 'الإيرادات' : 'الطلبات',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              formatter={(value) => (
                <span className="text-sm text-slate-600">
                  {value === 'revenue' ? 'الإيرادات' : 'الطلبات'}
                </span>
              )}
            />
            <Line
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
            <Line
              yAxisId="ord"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke="#22c55e"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#22c55e', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
