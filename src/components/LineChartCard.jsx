import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
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
    <section className="rounded-2xl bg-white p-6 shadow-sm border border-brand-100/50" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-900">الإيرادات والطلبات الشهرية</h2>
        <div className="flex gap-2">
           <span className="rounded-lg bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">آخر 6 أشهر</span>
        </div>
      </div>
      
      <div className="h-[280px] w-full" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthly} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={{ stroke: '#f1f5f9' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 80000]}
              tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
            />
            <YAxis
              yAxisId="ord"
              orientation="right"
              tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 1500]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Cairo, sans-serif',
                padding: '12px'
              }}
              formatter={(value, name) => [
                name === 'revenue' ? `${Number(value).toLocaleString('ar-LY')} د.ل` : value,
                name === 'revenue' ? 'الإيرادات' : 'الطلبات',
              ]}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value) => (
                <span className="text-sm font-semibold text-slate-600 ml-2">
                  {value === 'revenue' ? 'الإيرادات' : 'الطلبات'}
                </span>
              )}
            />
            <Line
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              name="revenue"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              yAxisId="ord"
              type="monotone"
              dataKey="orders"
              name="orders"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ r: 4, fill: '#f43f5e', strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
